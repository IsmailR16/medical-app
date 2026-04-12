import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface ChatBubbleProps {
  content: string;
  role: "user" | "assistant" | "system";
  timestamp?: string;
}

export function ChatBubble({ content, role, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const isSystem = role === "system";

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
              : isSystem
                ? "bg-[#F9FAFB] text-[#94A3B8] italic border border-[#1d3557]/[0.04]"
                : "rounded-tl-md bg-white border border-[#1d3557]/[0.04] shadow-[0_1px_2px_rgba(29,53,87,0.03)]"
          )}
        >
          <p
            className={cn(
              "text-[13px] leading-relaxed whitespace-pre-wrap break-words overflow-hidden",
              isUser ? "text-white" : isSystem ? "text-[#94A3B8]" : "text-[#1d3557]"
            )}
          >
            {content}
          </p>
        </div>
        {timestamp && (
          <p className="text-[10px] text-[#94A3B8] mt-1 px-1">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
