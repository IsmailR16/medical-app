export type SessionStatus = "active" | "submitted" | "evaluated";

const FALLBACK_STYLE = "bg-zinc-50 text-zinc-500 border-zinc-200/50";

const STATUS_STYLE: Record<SessionStatus, string> = {
  active: "bg-amber-50 text-amber-700 border-amber-200/50",
  submitted: "bg-blue-50 text-blue-700 border-blue-200/50",
  evaluated: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
};

const STATUS_LABEL_LIST: Record<SessionStatus, string> = {
  active: "Pågående",
  submitted: "Inskickad",
  evaluated: "Avslutad",
};

const STATUS_LABEL_DETAIL: Record<SessionStatus, string> = {
  ...STATUS_LABEL_LIST,
  evaluated: "Utvärderad",
};

export const SESSION_STATUS_DOT: Partial<
  Record<SessionStatus, { color: string; pulse: boolean }>
> = {
  active: { color: "bg-amber-500", pulse: true },
  evaluated: { color: "bg-emerald-500", pulse: false },
};

export function getSessionStatusStyle(status: string): string {
  return STATUS_STYLE[status as SessionStatus] ?? FALLBACK_STYLE;
}

export function getSessionStatusLabel(
  status: string,
  variant: "list" | "detail" = "list",
): string {
  const map = variant === "detail" ? STATUS_LABEL_DETAIL : STATUS_LABEL_LIST;
  return map[status as SessionStatus] ?? status;
}
