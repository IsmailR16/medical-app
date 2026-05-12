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
