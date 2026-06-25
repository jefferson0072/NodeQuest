import { NextResponse } from "next/server";
import { settleJob } from "@/lib/settle";

export async function POST(_req, { params }) {
  const result = await settleJob(params.id);
  if (result.error)
    return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
