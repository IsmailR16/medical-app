export type ScoreTier = "excellent" | "good" | "pass" | "poor";

export function getScoreTier(score: number): ScoreTier {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "pass";
  return "poor";
}

const TEXT_COLOR: Record<ScoreTier, string> = {
  excellent: "text-emerald-600",
  good: "text-[#457b9d]",
  pass: "text-amber-600",
  poor: "text-rose-600",
};

const CIRCLE_STYLE: Record<ScoreTier, string> = {
  excellent: "text-emerald-600 bg-emerald-50 border-emerald-200",
  good: "text-[#457b9d] bg-[#457b9d]/[0.08] border-[#457b9d]/20",
  pass: "text-amber-600 bg-amber-50 border-amber-200",
  poor: "text-rose-600 bg-rose-50 border-rose-200",
};

const BADGE_STYLE: Record<ScoreTier, string> = {
  excellent: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  good: "bg-[#457b9d]/[0.08] text-[#457b9d] border-[#457b9d]/20",
  pass: "bg-amber-50 text-amber-700 border-amber-200/50",
  poor: "bg-rose-50 text-rose-700 border-rose-200/50",
};

const BAR_COLOR: Record<ScoreTier, string> = {
  excellent: "bg-emerald-500",
  good: "bg-[#457b9d]",
  pass: "bg-amber-500",
  poor: "bg-rose-500",
};

const LABEL: Record<ScoreTier, string> = {
  excellent: "Utmärkt",
  good: "Bra",
  pass: "Godkänt",
  poor: "Behöver förbättring",
};

export const getScoreTextColor = (score: number) => TEXT_COLOR[getScoreTier(score)];
export const getScoreCircleStyle = (score: number) => CIRCLE_STYLE[getScoreTier(score)];
export const getScoreBadgeStyle = (score: number) => BADGE_STYLE[getScoreTier(score)];
export const getScoreBarColor = (score: number) => BAR_COLOR[getScoreTier(score)];
export const getScoreLabel = (score: number) => LABEL[getScoreTier(score)];
