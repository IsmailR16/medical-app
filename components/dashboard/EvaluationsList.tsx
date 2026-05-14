"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Clock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import type { EvaluationListItem } from "@/lib/db/dashboard";
import {
  getScoreBadgeStyle,
  getScoreCircleStyle,
} from "@/lib/ui/scores";
import { loadMoreEvaluations } from "@/app/(dashboard)/evaluations/actions";

const RUBRIC_AREAS = [
  { key: "anamnes", label: "Anamnes" },
  { key: "undersokningar", label: "Undersökningar" },
  { key: "kommunikation", label: "Kommunikation" },
  { key: "klinisk_resonemang", label: "Kliniskt resonemang" },
  { key: "bedomning_och_atgard", label: "Bedömning & åtgärd" },
] as const;

function areaScore(ev: EvaluationListItem, areaKey: string): number {
  const a = ev.rubric_scores.find((x) => x.area === areaKey);
  return a ? Math.round(a.raw_score * 100) : 0;
}

interface EvaluationsListProps {
  initialEvaluations: EvaluationListItem[];
  initialNextCursor: string | null;
}

export function EvaluationsList({
  initialEvaluations,
  initialNextCursor,
}: EvaluationsListProps) {
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>(initialEvaluations);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [pending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!cursor || pending) return;
    startTransition(async () => {
      try {
        const page = await loadMoreEvaluations(cursor);
        setEvaluations((prev) => [...prev, ...page.evaluations]);
        setCursor(page.nextCursor);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kunde inte ladda fler utvärderingar.");
      }
    });
  }

  return (
    <>
      <h2 className="text-lg font-bold text-[#1d3557] tracking-tight mb-4">
        Alla utvärderingar
      </h2>

      <div className="space-y-3">
        {evaluations.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] hover:shadow-[0_8px_24px_-8px_rgba(29,53,87,0.1)] transition-all duration-300 p-5 md:p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Score Circle */}
              <div className="flex-shrink-0">
                <div
                  className={`h-16 w-16 rounded-2xl border-2 flex items-center justify-center ${getScoreCircleStyle(Math.round(ev.total_score * 100))}`}
                >
                  <span className="text-xl font-extrabold font-mono">
                    {Math.round(ev.total_score * 100)}
                  </span>
                </div>
              </div>

              {/* Case Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#1d3557] mb-1">
                      {ev.case_title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#94A3B8]">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg border border-[#1d3557]/[0.06] text-[11px] font-semibold">
                        {ev.case_specialty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {new Date(ev.started_at).toLocaleDateString("sv-SE")}
                      </span>
                      {ev.duration_min !== null && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {ev.duration_min} min
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border whitespace-nowrap ${getScoreBadgeStyle(Math.round(ev.total_score * 100))}`}
                  >
                    {ev.grade}
                  </span>
                </div>

                {/* Mini Score Breakdown — top 4 rubric areas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RUBRIC_AREAS.slice(0, 4).map(({ key, label }) => (
                    <div key={key}>
                      <p className="text-[11px] text-[#94A3B8] mb-0.5">{label}</p>
                      <p className="text-[14px] font-bold text-[#1d3557] font-mono">
                        {areaScore(ev, key)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 lg:ml-4">
                <Link
                  href={`/evaluations/${ev.session_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#1d3557] text-[12px] font-semibold rounded-xl hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap"
                >
                  Se detaljer
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {cursor && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={pending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#1d3557]/[0.06] text-[#1d3557] text-[13px] font-semibold rounded-xl hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                Laddar…
              </>
            ) : (
              "Visa fler"
            )}
          </button>
        </div>
      )}
    </>
  );
}
