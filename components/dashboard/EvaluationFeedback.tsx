"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

interface EvaluationFeedbackProps {
  sessionId: string;
  caseTitle: string;
}

/**
 * Contextual feedback prompt on the evaluation page. Opens the shared
 * FeedbackModal pre-filled with the graded case/session so beta feedback
 * about grading quality is traceable in the feedback email.
 */
export function EvaluationFeedback({ sessionId, caseTitle }: EvaluationFeedbackProps) {
  const [open, setOpen] = useState(false);

  const context = `[Bedömning] ${caseTitle} — session ${sessionId}`;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#1d3557]/[0.06] bg-[#F9FAFB] px-5 py-4">
        <div>
          <p className="text-[14px] font-semibold text-[#1d3557]">
            Var den här bedömningen rättvis?
          </p>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            Din återkoppling hjälper oss kalibrera AI-bedömningen under betan.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#1d3557]/[0.08] text-[#1d3557] text-[12px] font-semibold rounded-xl hover:border-[#1d3557]/[0.16] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5" strokeWidth={1.5} />
          Rapportera problem med bedömningen
        </button>
      </div>

      <FeedbackModal
        open={open}
        onClose={() => setOpen(false)}
        initialCategory="bug"
        context={context}
        placeholder="Vad blev fel i poängsättningen eller feedbacken?"
        title="Återkoppling på bedömningen"
        description="Tyckte du poängsättningen eller feedbacken blev fel? Beskriv vad — det hjälper oss kalibrera AI-bedömningen."
      />
    </>
  );
}
