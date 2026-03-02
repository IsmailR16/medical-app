import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  content: string;
  role: "user" | "assistant" | "system";
  timestamp?: string;
}

export function ChatBubble({ content, role, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div className="max-w-[80%] space-y-1">
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-[#0f766e] text-white"
              : isSystem
                ? "bg-muted text-muted-foreground italic"
                : "border border-border bg-white text-foreground dark:bg-card"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
        {timestamp && (
          <p
            className={cn(
              "px-2 text-xs text-muted-foreground",
              isUser && "text-right"
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
