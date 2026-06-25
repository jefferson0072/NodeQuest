# Bounty Compute

Post a GPU job, lock a token (QST) reward, and let idle GPUs **race** to finish it.
Fairest valid result wins via a tier-matched **weighted lottery** — not just raw speed —
so big GPUs don't win everything and small providers stay in the game.

Built with **Next.js (App Router)**, deployable to **Vercel**. No smart contract required:
the backend acts as the escrow + matchmaker, and token payouts go through `@solana/web3.js`.

## How it works

1. **Post** — User posts a job + locks a QST reward (escrow).
2. **Race** — Eligible same-tier GPUs compete.
3. **Verify** — Redundancy + spot-check filters fake/wrong results.
4. **Lottery + pay** — Weighted lottery (reputation + small speed bonus) picks the
   winner; escrow pays out minus a 3% platform fee; a receipt records price + route hash.

## Fairness model

- **Tiers** — Light / Standard / Heavy. A job only accepts GPUs of the same tier.
- **Weighted lottery** — `tickets = 1 + reputation + speedBonus`. Reliable providers get
  better odds; newcomers always get at least one ticket.
- **Reputation** — Win → up; faked/invalid result → down.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. It starts in **SIMULATION MODE** — no keys, no real funds.
Use "Simulate race" then "Verify, lottery & pay" on any job.

## Connect a real machine (provider agent)

The agent lets an actual computer join as GPU supply: it detects the GPU, registers
(the **server** assigns the tier), polls for matching jobs, does real compute, and
submits results.

```bash
# auto-detect GPU (needs nvidia-smi), or pass --gpu / --vram manually
node agent/bounty-agent.mjs --name my-rig --wallet <your-solana-address>
node agent/bounty-agent.mjs --name my-rig --gpu "RTX 3090" --wallet <addr>
```

Then post a job in the web UI — running agents pick it up automatically and you can
settle it. The compute is deterministic so honest agents agree on the same result hash
(that's how consensus verification works). Swap `runWorkload()` in the agent for real
model inference (Ollama / Python) when ready, keeping the output deterministic.

## Going live with real QST payouts

Copy `.env.example` to `.env.local` and fill in:

- `SOLANA_RPC_URL` — e.g. `https://api.devnet.solana.com`
- `TOKEN_MINT` — your QST SPL token mint address
- `PLATFORM_WALLET_SECRET` — platform wallet secret key (JSON array)

When these are set, the app switches to **LIVE** mode and sends real SPL transfers.

## Production notes

- The in-memory store (`lib/store.js`) resets on serverless. Swap it for Postgres/Neon
  (keep the same function names) before real deployment.
- Verification is an MVP (consensus + spot-check). Upgrade to TEE attestation or zk proofs
  for stronger guarantees.
- The escrow is custodial (backend-held). Move to an on-chain escrow program if/when you
  want trustless settlement.
