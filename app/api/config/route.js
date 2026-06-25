import { NextResponse } from "next/server";
import {
  paymentsConfigured,
  getPlatformAddress,
  getMintDecimals,
} from "@/lib/solana";

export const dynamic = "force-dynamic";

// Public, non-secret config the client needs to build an escrow deposit.
export async function GET() {
  const paymentsReady = paymentsConfigured();
  if (!paymentsReady) {
    return NextResponse.json({ paymentsReady: false });
  }
  const [escrowWallet, decimals] = await Promise.all([
    getPlatformAddress(),
    getMintDecimals(),
  ]);
  // If the wallet secret or mint can't be read, payments aren't actually usable.
  // Report it cleanly instead of pretending it's ready (or 500-ing).
  if (!escrowWallet || decimals == null) {
    return NextResponse.json({
      paymentsReady: false,
      error: !escrowWallet
        ? "PLATFORM_WALLET_SECRET is invalid (must be a JSON array of 64 numbers)"
        : "Could not read TOKEN_MINT from SOLANA_RPC_URL (check the mint address and RPC)",
    });
  }
  return NextResponse.json({
    paymentsReady: true,
    tokenMint: process.env.TOKEN_MINT,
    escrowWallet,
    decimals,
  });
}
