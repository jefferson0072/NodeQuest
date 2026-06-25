#!/usr/bin/env node
/**
 * Bounty Compute - Provider Agent
 *
 * Run this on a machine with a GPU to join the network and earn QST.
 * It detects your GPU, registers (the SERVER assigns your tier), then polls for
 * matching jobs, runs the work, and submits the result.
 *
 * Usage:
 *   node agent/bounty-agent.mjs --name my-rig --wallet <solana-address>
 *   node agent/bounty-agent.mjs --name my-rig --gpu "RTX 3060" --wallet <addr>
 *   node agent/bounty-agent.mjs --name my-rig --vram 24 --wallet <addr>
 *
 * Options:
 *   --name    machine name (required)
 *   --wallet  Solana address that receives QST (required for real payouts)
 *   --gpu     GPU model to report (must match the platform catalog); optional
 *   --vram    VRAM in GB, used if the GPU isn't in the catalog; optional
 *   --server  backend URL (default http://localhost:3000)
 *   --poll    poll interval ms (default 3000)
 */

import crypto from "node:crypto";
import { execSync } from "node:child_process";

// ---------- args ----------
function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val =
        argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      a[key] = val;
    }
  }
  return a;
}
const args = parseArgs(process.argv);
const SERVER = args.server || "http://localhost:3000";
const POLL = Number(args.poll) || 3000;
const NAME = args.name;
const WALLET = args.wallet || "";

if (!NAME) {
  console.error("Error: --name is required");
  process.exit(1);
}

// ---------- helpers ----------
const log = (...m) => console.log(`[${new Date().toLocaleTimeString()}]`, ...m);

async function api(path, opts) {
  const res = await fetch(SERVER + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { error: text };
  }
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

// Try to detect the local NVIDIA GPU. Returns { rawName, vram } or null.
function detectGpu() {
  try {
    const out = execSync(
      "nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits",
      { stdio: ["ignore", "pipe", "ignore"] }
    )
      .toString()
      .trim()
      .split("\n")[0];
    const [rawName, mb] = out.split(",").map((s) => s.trim());
    return { rawName, vram: Math.round(Number(mb) / 1024) };
  } catch {
    return null;
  }
}

// Map a detected GPU name to a platform catalog key (e.g. "RTX 3060").
function matchCatalog(rawName, catalog) {
  if (!rawName) return null;
  const keys = Object.keys(catalog || {});
  return keys.find((k) => rawName.toUpperCase().includes(k.toUpperCase())) || null;
}

// The actual work. Deterministic so honest agents agree on the same result hash
// (that's what makes consensus verification possible). Heavier tiers do more
// iterations = real CPU work. Swap this for real model inference later
// (e.g. Ollama / Python) keeping the output deterministic for verification.
function runWorkload(job) {
  const start = Date.now();
  const iterations = { 1: 200_000, 2: 600_000, 3: 1_500_000 }[job.tier] || 200_000;

  let h = crypto.createHash("sha256").update(String(job.input)).digest("hex");
  for (let i = 0; i < iterations; i++) {
    h = crypto.createHash("sha256").update(h).digest("hex");
  }

  // Deterministic, human-readable output for this workload + input.
  const output = `result(${job.workload}):${job.input}`;
  const resultHash =
    "0x" +
    crypto
      .createHash("sha256")
      .update(output + "|" + h.slice(0, 16))
      .digest("hex")
      .slice(0, 16);

  return { output, resultHash, elapsedMs: Date.now() - start };
}

// ---------- main ----------
let provider = null;
const done = new Set();

async function register() {
  const { catalog } = await api("/api/providers");
  let gpuModel = args.gpu || null;
  let vramGb = args.vram ? Number(args.vram) : undefined;

  if (!gpuModel) {
    const detected = detectGpu();
    if (detected) {
      gpuModel = matchCatalog(detected.rawName, catalog);
      vramGb = vramGb ?? detected.vram;
      log(`Detected GPU: ${detected.rawName} (${detected.vram}GB)`);
    } else {
      log("No NVIDIA GPU detected (nvidia-smi unavailable).");
    }
  }

  const reg = await api("/api/providers", {
    method: "POST",
    body: JSON.stringify({ name: NAME, gpuModel, vramGb, wallet: WALLET }),
  });
  provider = reg.provider;
  log(
    `Registered "${provider.name}" -> GPU ${provider.gpuModel} (${provider.vramGb}GB), ` +
      `SERVER-assigned Tier ${provider.tier}. Wallet: ${provider.wallet}`
  );
}

async function tick() {
  try {
    const { jobs } = await api(
      `/api/jobs/claimable?tier=${provider.tier}&providerId=${provider.id}`
    );
    for (const job of jobs) {
      if (done.has(job.id)) continue;
      done.add(job.id);
      log(`Job ${job.id} "${job.title}" (${job.reward} QST) - running...`);
      const { output, resultHash, elapsedMs } = runWorkload(job);
      await api(`/api/jobs/${job.id}/submit`, {
        method: "POST",
        body: JSON.stringify({
          providerId: provider.id,
          resultHash,
          output,
          elapsedMs,
        }),
      });
      log(`Submitted ${job.id} in ${elapsedMs}ms (hash ${resultHash})`);
    }
  } catch (e) {
    log("poll error:", e.message);
  }
}

async function main() {
  log(`Connecting to ${SERVER} ...`);
  await register();
  log(`Polling for Tier ${provider.tier} jobs every ${POLL}ms. Ctrl+C to stop.`);
  await tick();
  setInterval(tick, POLL);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
