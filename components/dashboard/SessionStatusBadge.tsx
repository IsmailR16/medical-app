import {
  getSessionStatusLabel,
  getSessionStatusStyle,
  SESSION_STATUS_DOT,
  type SessionStatus,
} from "@/lib/ui/session-status";

interface SessionStatusBadgeProps {
  status: string;
  variant?: "list" | "detail";
}

export function SessionStatusBadge({
  status,
  variant = "list",
}: SessionStatusBadgeProps) {
  const style = getSessionStatusStyle(status);
  const label = getSessionStatusLabel(status, variant);
  const dot = SESSION_STATUS_DOT[status as SessionStatus];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${style}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot.color} ${
            dot.pulse ? "animate-pulse" : ""
          }`}
        />
      )}
      {label}
    </span>
  );
}
