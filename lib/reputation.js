// Reputation rewards reliable providers but never fully locks out newcomers.

export const STARTING_REPUTATION = 1;
export const MAX_REPUTATION = 10;
export const MIN_REPUTATION = 0;

export function rewardWin(rep) {
  return Math.min(MAX_REPUTATION, rep + 1);
}

// Failing, faking, or no-show drops reputation faster than a win raises it.
export function penalize(rep) {
  return Math.max(MIN_REPUTATION, rep - 2);
}
