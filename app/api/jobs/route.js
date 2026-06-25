import { NextResponse } from "next/server";
import { listJobs, createJob, newJobId, getStats } from "@/lib/store";
import { paymentsConfigured } from "@/lib/solana";
import { WORKLOAD_CATALOG, assignJobTier } from "@/lib/tiers";

export async function GET() {
  const [jobs, stats] = await Promise.all([listJobs(), getStats()]);
  return NextResponse.json({
    jobs,
    stats,
    paymentsReady: paymentsConfigured(),
    workloads: WORKLOAD_CATALOG,
  });
}

export async function POST(req) {
  const body = await req.json();
  if (!body.title || !body.workload || !body.reward) {
    return NextResponse.json(
      { error: "title, workload and reward required" },
      { status: 400 }
    );
  }
  if (!WORKLOAD_CATALOG[body.workload]) {
    return NextResponse.json({ error: "unknown workload" }, { status: 400 });
  }
  // Tier is derived from the workload — any poster-supplied tier is ignored.
  const id = await newJobId();
  const job = await createJob({
    id,
    title: body.title,
    workload: body.workload,
    workloadLabel: WORKLOAD_CATALOG[body.workload].label,
    input: body.input,
    tier: assignJobTier(body.workload),
    reward: body.reward,
    poster: body.poster,
    deadlineSec: body.deadlineSec,
  });
  return NextResponse.json({ job });
}
