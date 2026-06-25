import { NextResponse } from "next/server";
import { getJob } from "@/lib/store";

export async function GET(_req, { params }) {
  const job = await getJob(params.id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}
