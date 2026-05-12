/**
 * Formatting helpers for clinical_data values from generated cases.
 *
 * Lab values come in the shape "129 g/L (ref 117-153)" — a measured value
 * plus a parenthesized reference range. UI displays nicer if the reference
 * range lives next to the test name and the value stays clean.
 */

/**
 * Split a lab value string like "129 g/L (ref 117-153)" into
 *   { value: "129 g/L", reference: "ref 117-153" }
 *
 * If no parenthesized reference is found, returns the original value with
 * reference = null.
 */
export function splitLabValue(raw: string): { value: string; reference: string | null } {
  if (!raw) return { value: "", reference: null };
  const match = raw.match(/^(.*?)\s*\(([^)]*?)\)\s*$/);
  if (!match) return { value: raw.trim(), reference: null };
  const [, value, reference] = match;
  return { value: value.trim(), reference: reference.trim() };
}

/**
 * Build a label that includes the reference range in parentheses.
 *   "Hb" + "ref 117-153" → "Hb (ref 117-153)"
 */
export function labLabelWithReference(name: string, reference: string | null): string {
  return reference ? `${name} (${reference})` : name;
}

/* ------------------------------------------------------------------ */
/*  Out-of-range detection                                            */
/* ------------------------------------------------------------------ */

/** Pull the first numeric value out of a string. Handles "129 g/L", "0.39", "4.6 x10^12/L" → 129, 0.39, 4.6. */
function extractFirstNumber(text: string): number | null {
  if (!text) return null;
  // Match a decimal number (period or comma as separator)
  const match = text.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse a reference range like "ref 117-153", "ref <5", "ref >2.5" into bounds.
 * Returns null if the range cannot be parsed.
 */
function parseReferenceBounds(ref: string): { low: number | null; high: number | null } | null {
  if (!ref) return null;
  // Strip leading "ref" / "referens" prefix if present
  const cleaned = ref.replace(/^(ref|referens)[\s:]*/i, "").trim();

  // "<5"  → high = 5
  const upperOnly = cleaned.match(/^<\s*(-?\d+(?:[.,]\d+)?)/);
  if (upperOnly) {
    return { low: null, high: parseFloat(upperOnly[1].replace(",", ".")) };
  }
  // ">2.5" → low = 2.5
  const lowerOnly = cleaned.match(/^>\s*(-?\d+(?:[.,]\d+)?)/);
  if (lowerOnly) {
    return { low: parseFloat(lowerOnly[1].replace(",", ".")), high: null };
  }
  // "117-153" or "0.35-0.46" — range
  const range = cleaned.match(/(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)/);
  if (range) {
    return {
      low: parseFloat(range[1].replace(",", ".")),
      high: parseFloat(range[2].replace(",", ".")),
    };
  }
  return null;
}

/**
 * Return true if a lab value falls outside its reference range.
 * Returns false if either value or range can't be parsed (conservative — no false alarms).
 */
export function isLabValueOutOfRange(value: string, reference: string | null): boolean {
  if (!reference) return false;
  const bounds = parseReferenceBounds(reference);
  if (!bounds) return false;
  const n = extractFirstNumber(value);
  if (n == null) return false;
  if (bounds.low != null && n < bounds.low) return true;
  if (bounds.high != null && n > bounds.high) return true;
  return false;
}
