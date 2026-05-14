/**
 * Session duration helper.
 *
 * Current implementation is naive: (endAt - startedAt) capped at MAX.
 * If a user opens a case, leaves the tab open for days, and submits later,
 * the wall-clock elapsed time would be reported as the "practice duration"
 * — clearly wrong. The cap prevents these outliers from polluting
 * per-session display and aggregate stats.
 *
 * TODO: replace with messages-based active-time estimation
 * (sum gaps between consecutive events, exclude gaps > 10 min). The cap
 * remains as a safety net.
 */

/** Maximum minutes counted per session. Outliers above are clamped. */
export const MAX_SESSION_MINUTES = 90;

/**
 * Compute the session's training duration in whole minutes, capped at
 * MAX_SESSION_MINUTES. Returns null when there's no end timestamp
 * (session still active).
 */
export function computeSessionDurationMin(
  startedAt: string,
  endAt: string | null
): number | null {
  if (!endAt) return null;
  const ms = new Date(endAt).getTime() - new Date(startedAt).getTime();
  if (ms <= 0) return 0;
  const minutes = Math.round(ms / 60000);
  return Math.min(minutes, MAX_SESSION_MINUTES);
}

/**
 * Format a duration for display. Returns "Pågående" when endAt is null,
 * otherwise the capped minutes followed by "min".
 */
export function formatSessionDuration(startedAt: string, endAt: string | null): string {
  if (!endAt) return "Pågående";
  const min = computeSessionDurationMin(startedAt, endAt);
  return `${min} min`;
}
