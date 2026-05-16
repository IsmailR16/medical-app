"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X, Loader2, Bug, Lightbulb, HelpCircle, MoreHorizontal } from "lucide-react";

export type FeedbackCategory = "bug" | "suggestion" | "question" | "other";

const CATEGORIES: { id: FeedbackCategory; label: string; icon: typeof Bug }[] = [
  { id: "bug", label: "Bugg", icon: Bug },
  { id: "suggestion", label: "Förslag", icon: Lightbulb },
  { id: "question", label: "Fråga", icon: HelpCircle },
  { id: "other", label: "Annat", icon: MoreHorizontal },
];

const MAX_LENGTH = 2000;

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  /** Category preselected each time the modal opens. */
  initialCategory?: FeedbackCategory;
  /**
   * Hidden context automatically prepended to the submitted feedback (not
   * shown to the user). Keeps traceability like case/session in the feedback
   * email without exposing internal ids or letting the user delete them.
   */
  context?: string;
  /** Placeholder for the (empty) message textarea. */
  placeholder?: string;
  title?: string;
  description?: string;
}

/**
 * Controlled feedback modal. Reused from two entry points: the sidebar
 * FeedbackButton (generic) and the evaluation page (pre-filled with the
 * graded case/session context). Posts to /api/feedback.
 */
export function FeedbackModal({
  open,
  onClose,
  initialCategory = "suggestion",
  context,
  placeholder = "Beskriv så detaljerat du vill...",
  title = "Skicka återkoppling",
  description = "Vi läser allt. Berätta vad som funkar, vad som inte funkar eller vad du saknar.",
}: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inflightRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset every time the modal opens: preselect category, clear the user's
  // message field (context is attached automatically on submit, not typed).
  useEffect(() => {
    if (open) {
      setCategory(initialCategory);
      setMessage("");
    }
  }, [open, initialCategory]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, submitting, onClose]);

  async function handleSubmit() {
    if (inflightRef.current) return;
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Skriv en kort beskrivning först.");
      return;
    }
    inflightRef.current = true;
    setSubmitting(true);
    const toastId = toast.loading("Skickar...");
    // Context (e.g. graded case/session) is attached here, not in the
    // editable field — the user can't delete it, so feedback stays traceable.
    const payloadMessage = context ? `${context}\n\n${trimmed}` : trimmed;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message: payloadMessage, url: pathname }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Kunde inte skicka.");
      }
      toast.success("Tack för din återkoppling!", { id: toastId });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel.", {
        id: toastId,
      });
    } finally {
      inflightRef.current = false;
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !submitting && onClose()}
            className="fixed inset-0 z-[70] bg-[#1d3557]/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-full max-w-[480px] bg-white rounded-2xl border border-[#1d3557]/[0.08] shadow-[0_24px_64px_-12px_rgba(29,53,87,0.25)] overflow-hidden pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
            >
              <button
                onClick={() => !submitting && onClose()}
                aria-label="Stäng"
                disabled={submitting}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#1d3557] hover:bg-[#F9FAFB] transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <div className="px-7 pt-8 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#457b9d]/15 to-[#a8dadc]/15 border border-[#1d3557]/[0.06] grid place-items-center mb-4">
                  <MessageCircle className="w-5 h-5 text-[#457b9d]" strokeWidth={1.5} />
                </div>
                <h2
                  id="feedback-title"
                  className="text-xl font-extrabold text-[#1d3557] tracking-tight mb-1"
                >
                  {title}
                </h2>
                <p className="text-[13px] text-[#64748B] leading-relaxed mb-5">
                  {description}
                </p>

                {/* Category */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const selected = category === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        disabled={submitting}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          selected
                            ? "border-[#457b9d]/40 bg-[#457b9d]/[0.06] text-[#457b9d]"
                            : "border-[#1d3557]/[0.06] text-[#94A3B8] hover:border-[#1d3557]/[0.12] hover:text-[#1d3557]"
                        } disabled:opacity-50`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-[11px] font-semibold">{c.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Message */}
                <label className="block text-[12px] font-semibold text-[#1d3557] mb-1.5">
                  Meddelande
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MAX_LENGTH}
                  disabled={submitting}
                  rows={5}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#1d3557]/[0.06] rounded-xl text-[13px] text-[#1d3557] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#457b9d]/40 focus:shadow-[0_0_0_3px_rgba(69,123,157,0.08)] transition-all duration-300 resize-none disabled:opacity-50"
                />
                <p className="text-[10.5px] text-[#94A3B8] mt-1 text-right">
                  {message.length}/{MAX_LENGTH}
                </p>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || message.trim().length === 0}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-[#457b9d] text-white text-[13px] font-semibold rounded-xl px-6 py-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a6781] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_-4px_rgba(69,123,157,0.4)] cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                      Skickar...
                    </>
                  ) : (
                    "Skicka"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
