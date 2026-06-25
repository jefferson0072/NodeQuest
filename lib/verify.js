// Verification: how we trust a provider actually did the work.
//
// MVP strategy = redundancy + spot-check:
//   - If 2+ submissions share the same result hash, that hash is "consensus"
//     and those submissions are marked valid.
//   - If only one submission exists, we accept it but flag it for a spot-check
//     (re-run later / trust provider reputation).
//
// Swap this out later for TEE attestation or zk proofs without touching the
// rest of the app.

export function verifySubmissions(submissions) {
  if (submissions.length === 0) return [];

  const counts = {};
  for (const s of submissions) {
    counts[s.resultHash] = (counts[s.resultHash] || 0) + 1;
  }

  // The hash agreed on by the most providers wins consensus.
  let consensusHash = null;
  let best = 0;
  for (const [hash, count] of Object.entries(counts)) {
    if (count > best) {
      best = count;
      consensusHash = hash;
    }
  }

  const consensusReached = best >= 2;

  return submissions.map((s) => {
    if (consensusReached) {
      return {
        ...s,
        valid: s.resultHash === consensusHash,
        verifyNote:
          s.resultHash === consensusHash
            ? "Matches consensus result"
            : "Disagrees with consensus - rejected",
      };
    }
    // Single submission: accept but mark for spot-check.
    return {
      ...s,
      valid: true,
      verifyNote: "Accepted (single result) - flagged for spot-check",
    };
  });
}
