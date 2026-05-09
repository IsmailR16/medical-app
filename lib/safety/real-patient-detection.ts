/**
 * Detection of potential real-patient data in chat input.
 *
 * Two levels:
 *   - "strong"  → block the message, insert system warning instead
 *   - "weak"    → let message through but insert system warning before it
 *   - "none"    → nothing to do
 *
 * Detection is regex-only for now (cheap, deterministic). Can be augmented
 * with an LLM pre-classifier later if false negatives become an issue.
 */

export type DetectionLevel = "none" | "weak" | "strong";

export interface DetectionResult {
  level: DetectionLevel;
  reason: string | null;
}

// Swedish personnummer patterns:
// - 12-digit (YYYYMMDD-XXXX or YYYYMMDDXXXX)
// - 10-digit (YYMMDD-XXXX) with required hyphen to avoid false positives
const PERSONNUMMER_12 =
  /\b(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])-?\d{4}\b/;
const PERSONNUMMER_10 =
  /\b\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])-\d{4}\b/;

// Phrases that indicate the student is referencing a real person from their life.
// Case-insensitive. Tightened so generic words alone don't trigger.
const WEAK_PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  {
    regex:
      /\bmin (mormor|morfar|farmor|farfar|bror|syster|son|dotter|fru|man|partner|sambo|granne|kollega|chef|vän|kompis)\b/i,
    reason: "Möjlig referens till en verklig person i ditt liv",
  },
  {
    regex:
      /\bmin (mamma|pappa|moster|faster|morbror|farbror)\b[^.!?\n]*\b(har|hade|är|var|blev|drabbades|fick|sökte)\b/i,
    reason: "Möjlig referens till en verklig anhörig",
  },
  {
    regex: /\b(vfu|verksamhetsförlagd|under praktik(en)?|på praktik(en)?)\b/i,
    reason: "Referens till verklig klinisk praktik (VFU)",
  },
  {
    regex: /\b(journal(en|er|anteckning(en|ar)?)|i journalen)\b/i,
    reason: "Referens till riktig journalinformation",
  },
  {
    regex: /\b(riktig|verklig|på riktigt) (patient|person|fall|case)\b/i,
    reason: "Explicit referens till verkligt fall",
  },
  {
    regex: /\b(från jobbet|på jobbet|på sjukhuset där jag)\b/i,
    reason: "Referens till verklig arbetsmiljö",
  },
];

export function detectRealPatientData(text: string): DetectionResult {
  if (!text || text.trim().length === 0) {
    return { level: "none", reason: null };
  }

  // STRONG — personnummer
  if (PERSONNUMMER_12.test(text) || PERSONNUMMER_10.test(text)) {
    return { level: "strong", reason: "Möjligt personnummer upptäckt" };
  }

  // WEAK — references to real people / contexts
  for (const { regex, reason } of WEAK_PATTERNS) {
    if (regex.test(text)) {
      return { level: "weak", reason };
    }
  }

  return { level: "none", reason: null };
}

/**
 * Standardized warning copy for the system message inserted into the chat.
 */
export const SAFETY_WARNING = {
  strong: (reason: string) =>
    `⚠️ Ditt meddelande blockerades. ${reason}. Diagnostika är endast för fiktiva patientfall — skriv aldrig in personnummer eller andra uppgifter som identifierar en verklig person. Ditt meddelande har inte skickats. Skriv om det utan identifierande information.`,
  weak: (reason: string) =>
    `⚠️ ${reason}. Diagnostika är endast en simulering med fiktiva fall. Använd aldrig riktiga patient- eller personuppgifter. Ditt meddelande har skickats men påminn dig om att hålla all information fiktiv.`,
};
