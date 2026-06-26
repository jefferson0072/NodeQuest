# NodeQuest

A marketplace for AI compute. Post an AI task with a token reward, and people
running spare GPUs compete to complete it. The fastest, most reliable provider
wins and gets paid in **QST** — 80% to the winner, 20% burned, no platform fee.

Built with **Next.js (App Router)**, **Upstash Redis** for storage, and
**Solana** for payments. No custom smart contract — the backend handles escrow,
matchmaking, and settlement, and token transfers go through `@solana/web3.js`.

**NodeQuest token CA:** `iACepJW3vyevPBMe2CwyzLTF9Hj6nWRYW4QukqVEASY`

> Status: **live** — text (LLM) workloads via Ollama, with real on-chain escrow,
> payouts, and burns settled in QST.

---

## How it works

1. **Post & fund** — A poster picks a workload, sets a QST reward, and deposits
   it from their wallet into the escrow wallet. The job opens only after the
   deposit is verified on-chain.
2. **Compete** — Providers running the agent on their GPUs pick up jobs that
   match their tier, run the task on a real model (Ollama), and submit the result.
3. **Verify** — Empty/malformed results are rejected; matching results across
   providers gain a consensus boost.
4. **Settle** — At the deadline, a reputation-weighted lottery picks the winner.
   The reward is split on-chain: **80% to the winner, 20% burned.**

### Fairness

- **Tiers** (Light / Standard / Heavy) are assigned by the platform from the GPU
  model and the workload — never chosen by users. A job only competes among GPUs
  in its own tier.
- **Weighted lottery** — `tickets = 1 + reputation + speedBonus + consensusBonus`.
  Reliable/fast providers get better odds; newcomers can still win.
- **Reputation** rises on wins, falls on invalid results.

---

## Tech stack

| Layer | Choice |
|---|---|
| Web app / API | Next.js 14 (App Router) |
| Storage | Upstash Redis (in-memory fallback for local dev) |
| Payments | Solana SPL token (`@solana/web3.js`, `@solana/spl-token`) |
| Wallet | `@solana/wallet-adapter` (Phantom, Solflare, …) |
| Compute (provider side) | Ollama |
| Hosting | Vercel (cron for auto-settlement) |

---

## Run locally

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without configuration, the app runs in a **local dev mode**: data is kept in
memory (resets on restart) and on-chain payouts are disabled. Fill in the values
listed in `.env.example` to enable persistence and real payments.

---

## For providers (earn QST)

Run the agent on a machine with a GPU. It detects the GPU, registers (the server
assigns your tier), polls for matching jobs, runs them, and submits results.

1. Install **[Ollama](https://ollama.com/download)** and pull a model, e.g.:
   ```bash
   ollama pull llama3.1:8b
   ```
2. Clone this repo:
   ```bash
   git clone https://github.com/jefferson0072/nodequest.git
   cd nodequest
   ```
3. Run the agent, pointing at the deployed app:
   ```bash
   node agent/bounty-agent.mjs --name my-rig --wallet <your-solana-address> --server https://your-app.vercel.app
   ```

Useful flags: `--gpu "RTX 3090"` / `--vram 24` (override detection),
`--ollama <url>`, `--model <name>`, `--poll <ms>`. The agent has **no npm
dependencies** — just Node 18+.

---

## For posters (run a task)

1. Open the app and connect a Solana wallet.
2. Choose a workload, write your prompt, set a reward.
3. Click **Fund & post** — approve the QST deposit in your wallet.
4. When the job settles, the result appears on the job's card.

---

## Configuration

All configuration is done through environment variables. Copy `.env.example` to
`.env.local` for local dev, or add the same values in your host's project
settings. See `.env.example` for the full list and what each value is for.

Until payments are configured, settlement returns "payouts not configured"
instead of moving funds — everything else still works.

---

## Deploy to Vercel

1. Import the repo into Vercel (Next.js is auto-detected).
2. Add your configuration (see `.env.example`).
3. Deploy. `vercel.json` registers a cron that auto-settles jobs at their
   deadline (frequent crons require a Vercel Pro plan; the manual settle button
   is the fallback otherwise).

---

## Going live

The payment code is complete but only fires once real tokens exist:

1. **Create the QST token** (an SPL mint).
2. **Fund the escrow wallet** with SOL (for transaction fees).
3. Add the required configuration in your host (see `.env.example`).
4. Do a **tiny test bounty** first to validate the full deposit → settle → burn
   path before opening it up.

---

## Project structure

```
app/
  page.js                  Landing page
  how-it-works/            Explainer page
  bounty-compute/          Dashboard (post jobs, view board, connect wallet)
  api/
    jobs/                  Create/list jobs, submit results, settle
    providers/             Register/list providers
    config/                Public config for the client (mint, escrow address)
    cron/settle/           Auto-settlement endpoint (Vercel Cron)
lib/
  store.js                 Upstash-backed data store
  solana.js               Token transfers, burns, deposit verification
  settle.js               Settlement orchestration (verify → lottery → pay/burn)
  verify.js               Result verification
  lottery.js              Weighted winner selection
  tiers.js                GPU + workload tier catalogs
  reputation.js           Provider reputation
agent/
  bounty-agent.mjs        Provider CLI agent (clone the repo to run it)
```

---

## Roadmap

- [ ] Hardening: rate limiting, input limits, anti-sybil
- [ ] Stronger verification (TEE attestation / proofs)
```
