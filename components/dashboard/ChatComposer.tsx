"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { IconSend } from "@tabler/icons-react";
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
    <Card className="border-border h-[700px] flex flex-col overflow-hidden">
      <CardHeader className="border-b border-border py-4">
        <CardTitle className="text-lg">Patient-intervju</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-6">
          <div className="space-y-4">
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
              <div className="flex justify-start" role="status" aria-live="polite">
                <div className="bg-muted rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <span>Patienten skriver</span>
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        {isActive ? (
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ställ en fråga till patienten…"
                maxLength={2000}
                disabled={sending}
                aria-label="Meddelande"
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                size="icon"
                aria-label="Skicka"
              >
                <IconSend className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ställ öppna frågor för att samla anamnes och förstå patientens tillstånd
            </p>
          </div>
        ) : (
          <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">
            Sessionen är avslutad.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
