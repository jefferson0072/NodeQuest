import { NextResponse } from "next/server";
import { getJob, getProvider, addSubmission, newSubmissionId } from "@/lib/store";
import { isEligible } from "@/lib/tiers";

// A provider submits a result for a job.
export async function POST(req, { params }) {
  const job = await getJob(params.id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status !== "open")
    return NextResponse.json({ error: "Job is not open" }, { status: 400 });

  const body = await req.json();
  const provider = await getProvider(body.providerId);
  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  // Tier gate: only same-tier GPUs can enter.
  if (!isEligible(provider, job)) {
    return NextResponse.json(
      { error: `Provider tier ${provider.tier} cannot enter a tier ${job.tier} job` },
      { status: 400 }
    );
  }

  // Prevent double entry.
  if (job.submissions.some((s) => s.providerId === provider.id)) {
    return NextResponse.json({ error: "Provider already entered" }, { status: 400 });
  }

  const submission = {
    id: await newSubmissionId(),
    providerId: provider.id,
    providerName: provider.name,
    resultHash: body.resultHash || "0xUNKNOWN",
    output: typeof body.output === "string" ? body.output : "",
    elapsedMs: Number(body.elapsedMs) || 5000,
    at: Date.now(),
    valid: false, // set during verification at settle time
  };

  await addSubmission(job.id, submission);
  return NextResponse.json({ submission });
}
