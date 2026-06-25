// Token payment layer — REAL transfers only (no simulation).
//
// Requires these env vars to move funds:
//   SOLANA_RPC_URL          your Helius mainnet RPC
//   TOKEN_MINT              the QST SPL mint address
//   PLATFORM_WALLET_SECRET  platform wallet secret key (JSON array)
//
// Until those are set, paymentsConfigured() is false and settlement that needs
// a payout will return a clear "not configured" error instead of faking it.

export function paymentsConfigured() {
  return !!(
    process.env.SOLANA_RPC_URL &&
    process.env.TOKEN_MINT &&
    process.env.PLATFORM_WALLET_SECRET
  );
}

async function getContext() {
  const web3 = await import("@solana/web3.js");
  const splToken = await import("@solana/spl-token");
  const connection = new web3.Connection(process.env.SOLANA_RPC_URL, "confirmed");
  const secret = Uint8Array.from(JSON.parse(process.env.PLATFORM_WALLET_SECRET));
  const platform = web3.Keypair.fromSecretKey(secret);
  const mint = new web3.PublicKey(process.env.TOKEN_MINT);
  return { web3, splToken, connection, platform, mint };
}

// Send QST from the platform wallet to a winner.
export async function payWinner({ jobId, amount, toWallet }) {
  if (!paymentsConfigured()) {
    throw new Error(
      "Payouts not configured: set SOLANA_RPC_URL, TOKEN_MINT and PLATFORM_WALLET_SECRET"
    );
  }
  const { web3, splToken, connection, platform, mint } = await getContext();
  const recipient = new web3.PublicKey(toWallet);

  const fromAta = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    platform,
    mint,
    platform.publicKey
  );
  const toAta = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    platform,
    mint,
    recipient
  );

  const mintInfo = await splToken.getMint(connection, mint);
  const rawAmount = BigInt(Math.round(amount * 10 ** mintInfo.decimals));

  const signature = await splToken.transfer(
    connection,
    platform,
    fromAta.address,
    toAta.address,
    platform.publicKey,
    rawAmount
  );

  return { type: "payout", jobId, amount, toWallet, signature, at: Date.now() };
}

// Permanently burn QST from the platform wallet (reduces total supply).
export async function burnTokens({ jobId, amount }) {
  if (!paymentsConfigured()) {
    throw new Error("Burn not configured: missing Solana env vars");
  }
  const { splToken, connection, platform, mint } = await getContext();

  const fromAta = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    platform,
    mint,
    platform.publicKey
  );
  const mintInfo = await splToken.getMint(connection, mint);
  const rawAmount = BigInt(Math.round(amount * 10 ** mintInfo.decimals));

  const signature = await splToken.burn(
    connection,
    platform,
    fromAta.address,
    mint,
    platform.publicKey,
    rawAmount
  );

  return { type: "burn", jobId, amount, signature, at: Date.now() };
}
