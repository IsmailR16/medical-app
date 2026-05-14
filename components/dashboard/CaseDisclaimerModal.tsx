"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, X } from "lucide-react";

const STORAGE_PREFIX = "diagnostika.case-disclaimer-seen";

/**
 * Onboarding modal shown the first time a user enters a case session.
 * Reminds them that the patient is fictional and they must not enter real
 * patient data. After dismissal, flagged in localStorage (per-user key) and
 * not shown again for that user.
 *
 * Per-user key: if account is deleted and a new account signs up in the same
 * browser, the new user still sees the modal (different user_id = different key).
 *
 * NOTE: This is a UX nudge, not a legal requirement — users have already
 * accepted at /accept-terms with explicit "no real patient data" checkbox.
 */
export function CaseDisclaimerModal() {
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);

  const storageKey = user?.id ? `${STORAGE_PREFIX}.${user.id}` : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLoaded || !storageKey) return;
    const seen = window.localStorage.getItem(storageKey);
    if (!seen) setOpen(true);
  }, [isLoaded, storageKey]);

  function handleDismiss() {
    if (typeof window !== "undefined" && storageKey) {
      window.localStorage.setItem(storageKey, "1");
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1d3557]/40 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-disclaimer-title"
        className="relative w-full max-w-[520px] bg-white rounded-3xl border border-[#1d3557]/[0.08] shadow-[0_24px_64px_-12px_rgba(29,53,87,0.25)] overflow-hidden"
      >
        <button
          onClick={handleDismiss}
          aria-label="Stäng"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#1d3557] hover:bg-[#F9FAFB] transition-all duration-200 cursor-pointer"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div className="px-8 pt-10 pb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
            <AlertTriangle className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
          </div>

          <h2
            id="case-disclaimer-title"
            className="text-xl font-extrabold text-[#1d3557] tracking-tight mb-3"
          >
            Detta är en utbildningssimulering
          </h2>

          <div className="space-y-3 text-[14px] text-[#1d3557]/80 leading-relaxed">
            <p>
              Patienten du samtalar med är en{" "}
              <strong className="text-[#1d3557]">AI-patient i ett fiktivt fall</strong>.
              Allt du skriver i chatten lagras kopplat till ditt konto.
            </p>
            <p className="font-semibold text-[#1d3557]">Skriv aldrig in:</p>
            <ul className="space-y-1.5 list-disc list-inside marker:text-[#94A3B8]">
              <li>Namn, personnummer eller andra identifierande uppgifter</li>
              <li>Information från riktiga journaler eller VFU-patienter</li>
              <li>Hälsouppgifter om dig själv eller anhöriga</li>
            </ul>
            <p className="text-[13px] text-[#94A3B8] pt-2">
              Bedömning och feedback är endast träningsåterkoppling — inte
              formell examination.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full mt-6 inline-flex items-center justify-center bg-[#457b9d] text-white text-[13px] font-semibold rounded-xl px-6 py-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a6781] active:scale-[0.99] shadow-[0_4px_16px_-4px_rgba(69,123,157,0.4)] cursor-pointer"
          >
            Jag förstår, fortsätt
          </button>
        </div>
      </div>
    </div>
  );
}
