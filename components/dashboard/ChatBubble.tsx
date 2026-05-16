import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, FileText } from "lucide-react";

interface ChatBubbleProps {
  content: string;
  role: "user" | "assistant" | "system";
  timestamp?: string;
}

export function ChatBubble({ content, role, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const isSystem = role === "system";

  // The diagnosis submission is saved as a user message with a fixed format
  // (see the submitDiagnosis branch in /api/sessions/[id]/messages). Render it
  // as a distinct "submitted assessment" card instead of a plain chat bubble.
  // Require all three section headers so a real chat message that merely
  // starts with "DIAGNOS:" can't be misdetected as a submission.
  const isSubmission =
    isUser &&
    /^DIAGNOS:/.test(content) &&
    content.includes("\nDIFFERENTIALDIAGNOSER:") &&
    content.includes("\nHANDLÄGGNINGSPLAN:");

  if (isSubmission) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] w-full bg-[#457b9d]/[0.04] border border-[#457b9d]/25 rounded-xl px-4 py-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <FileText
              className="w-4 h-4 text-[#457b9d] flex-shrink-0"
              strokeWidth={1.5}
            />
            <p className="text-[11px] font-semibold text-[#457b9d] uppercase tracking-wide">
              Inlämnad bedömning
            </p>
          </div>
          <p className="text-[13px] text-[#1d3557] leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
          {timestamp && (
            <p className="text-[10px] text-[#94A3B8] mt-2">{timestamp}</p>
          )}
        </div>
      </div>
    );
  }

  // System messages get a distinct full-width warning card — never confused
  // with the AI-patient (which stays in character).
  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-[90%] w-full bg-amber-50 border border-amber-200/70 rounded-xl px-4 py-3 flex gap-3">
          <AlertTriangle
            className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-amber-900 uppercase tracking-wide mb-1">
              Diagnostika-systemet
            </p>
            <p className="text-[13px] text-amber-900 leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
            {timestamp && (
              <p className="text-[10px] text-amber-700/70 mt-1.5">{timestamp}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      {/* Patient icon for assistant messages */}
      {isAssistant && (
        <div className="w-7 h-7 rounded-lg bg-[#457b9d]/10 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-[#457b9d]" strokeWidth={1.5} />
        </div>
      )}
      <div className={cn("max-w-[75%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "rounded-tr-md bg-gradient-to-br from-[#457b9d] to-[#3a6781] shadow-[0_2px_8px_-2px_rgba(69,123,157,0.25)]"
              : "rounded-tl-md bg-white border border-[#1d3557]/[0.04] shadow-[0_1px_2px_rgba(29,53,87,0.03)]"
          )}
        >
          <p
            className={cn(
              "text-[13px] leading-relaxed whitespace-pre-wrap break-words overflow-hidden",
              isUser ? "text-white" : "text-[#1d3557]"
            )}
          >
            {content}
          </p>
        </div>
        {timestamp && (
          <p className="text-[10px] text-[#94A3B8] mt-1 px-1">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
