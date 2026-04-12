"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

import { Send } from "lucide-react";
import { ChatBubble } from "@/components/dashboard/ChatBubble";
import type { MessageRow } from "@/lib/db/dashboard";

interface ChatComposerProps {
  sessionId: string;
  initialMessages: MessageRow[];
  sessionStatus: string;
}

export function ChatComposer({
  sessionId,
  initialMessages,
  sessionStatus,
}: ChatComposerProps) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = sessionStatus === "active";

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages[messages.length - 1]?.id]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || sending || !isActive) return;

    setSending(true);
    setInput("");

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    const userMsg: MessageRow = {
      id: tempId,
      role: "user",
      content,
      clinical_data_type: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Något gick fel.");
      }

      const { message: assistantMsg } = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsg.id,
          role: assistantMsg.role,
          content: assistantMsg.content,
          clinical_data_type: null,
          created_at: assistantMsg.created_at,
        },
      ]);
    } catch (err) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error(
        err instanceof Error ? err.message : "Kunde inte skicka meddelandet."
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, isActive, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] h-[700px] flex flex-col overflow-hidden">
      <div className="border-b border-[#1d3557]/[0.04] px-6 py-4">
        <h2 className="text-[15px] font-bold text-[#1d3557] tracking-tight">Patient-intervju</h2>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-6">
          <div className="space-y-0">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                content={msg.content}
                role={msg.role as "user" | "assistant" | "system"}
                timestamp={new Date(msg.created_at).toLocaleTimeString("sv-SE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            ))}
            {sending && (
              <div className="flex justify-start mb-4" role="status" aria-live="polite">
                <div className="w-7 h-7 rounded-lg bg-[#457b9d]/10 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
                  <span className="w-3.5 h-3.5 text-[#457b9d]" />
                </div>
                <div className="bg-white border border-[#1d3557]/[0.04] rounded-2xl rounded-tl-md px-4 py-3 text-[13px] text-[#94A3B8] flex items-center gap-2 shadow-[0_1px_2px_rgba(29,53,87,0.03)]">
                  <span>Patienten skriver</span>
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#457b9d] animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#457b9d] animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#457b9d] animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        {isActive ? (
          <div className="border-t border-[#1d3557]/[0.04] p-4 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ställ en fråga till patienten…"
                maxLength={2000}
                autoFocus
                aria-label="Meddelande"
                className="flex-1 px-4 py-2.5 bg-[#F9FAFB] border border-[#1d3557]/[0.06] rounded-xl text-[13px] text-[#1d3557] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#457b9d]/40 focus:shadow-[0_0_0_3px_rgba(69,123,157,0.08)] transition-all duration-300"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                aria-label="Skicka"
                className="px-4 py-2.5 bg-[#457b9d] text-white rounded-xl text-[13px] font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a6781] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_8px_-2px_rgba(69,123,157,0.3)] flex items-center gap-1.5"
              >
                Skicka
                <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-2">
              Ställ öppna frågor för att samla anamnes och förstå patientens tillstånd
            </p>
          </div>
        ) : (
          <div className="border-t border-[#1d3557]/[0.04] p-4 text-center text-[13px] text-[#94A3B8]">
            Sessionen är avslutad.
          </div>
        )}
      </div>
    </div>
  );
}
