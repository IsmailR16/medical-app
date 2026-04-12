"use client";

import { useState } from "react";
import { DiagnosisModal } from "@/components/dashboard/DiagnosisModal";
import { FileText } from "lucide-react";

interface SessionHeaderProps {
  sessionId: string;
  title: string;
  specialty: string;
  difficulty: string;
  status: string;
  description: string;
}

const difficultyLabel: Record<string, string> = {
  easy: "Lätt",
  medium: "Medel",
  hard: "Svår",
};

const difficultyStyle: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  medium: "bg-amber-50 text-amber-700 border-amber-200/50",
  hard: "bg-rose-50 text-rose-700 border-rose-200/50",
};

export function SessionHeader({
  sessionId,
  title,
  specialty,
  difficulty,
  status,
  description,
}: SessionHeaderProps) {
  const [showDiagnosis, setShowDiagnosis] = useState(false);

  const isActive = status === "active";

  const statusLabel =
    status === "active"
      ? "Pågående"
      : status === "submitted"
        ? "Inskickad"
        : "Utvärderad";

  const statusStyle =
    status === "active"
      ? "bg-amber-50 text-amber-700 border-amber-200/50"
      : status === "submitted"
        ? "bg-blue-50 text-blue-700 border-blue-200/50"
        : "bg-emerald-50 text-emerald-700 border-emerald-200/50";

  return (
    <>
      <div className="mb-6 pb-5 border-b border-[#1d3557]/[0.04]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#1d3557] tracking-tight truncate">
                {title}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${difficultyStyle[difficulty] ?? "bg-zinc-50 text-zinc-500 border-zinc-200/50"}`}>
                {difficultyLabel[difficulty] ?? difficulty}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-[#1d3557]/[0.06] text-[#94A3B8] bg-[#F9FAFB]">
                {specialty}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${statusStyle}`}>
                {status === "active" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                )}
                {statusLabel}
              </span>
            </div>
            <p className="text-[13px] text-[#94A3B8] line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
          {isActive && (
            <button
              onClick={() => setShowDiagnosis(true)}
              className="shrink-0 inline-flex items-center gap-2 bg-[#e63946] text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#d62839] active:scale-[0.98] shadow-[0_4px_16px_-4px_rgba(230,57,70,0.4)]"
            >
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              Lämna in diagnos
            </button>
          )}
        </div>
      </div>

      <DiagnosisModal
        open={showDiagnosis}
        onOpenChange={setShowDiagnosis}
        sessionId={sessionId}
      />
    </>
  );
}
