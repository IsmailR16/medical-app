"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Loader2, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";

import type { SessionListItem } from "@/lib/db/dashboard";
import { SessionStatusBadge } from "@/components/dashboard/SessionStatusBadge";
import { DeleteSessionButton } from "@/components/dashboard/DeleteSessionButton";
import { loadMoreSessions } from "@/app/(dashboard)/sessions/actions";

interface SessionsListProps {
  initialSessions: SessionListItem[];
  initialNextCursor: string | null;
}

function formatDuration(startedAt: string, endAt: string | null): string {
  if (!endAt) return "Pågående";
  const ms = new Date(endAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.round(ms / 60000);
  return `${mins} min`;
}

export function SessionsList({ initialSessions, initialNextCursor }: SessionsListProps) {
  const [sessions, setSessions] = useState<SessionListItem[]>(initialSessions);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [pending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!cursor || pending) return;
    startTransition(async () => {
      try {
        const page = await loadMoreSessions(cursor);
        setSessions((prev) => [...prev, ...page.sessions]);
        setCursor(page.nextCursor);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kunde inte ladda fler sessioner.");
      }
    });
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] text-center py-16 px-6">
        <div className="w-14 h-14 rounded-2xl bg-[#457b9d]/[0.06] flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-6 h-6 text-[#94A3B8]" strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-medium text-[#1d3557] mb-1">Inga sessioner ännu</p>
        <p className="text-[13px] text-[#94A3B8] mb-6">
          Starta ditt första patientfall för att börja träna!
        </p>
        <Link
          href="/cases"
          className="inline-block px-5 py-2.5 bg-[#457b9d] text-white text-[13px] font-semibold rounded-xl transition-all duration-300 hover:bg-[#3a6781] active:scale-[0.98] shadow-[0_2px_8px_-2px_rgba(69,123,157,0.3)]"
        >
          Starta ditt första fall
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)]">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_100px] gap-4 px-6 py-3 border-b border-[#1d3557]/[0.04] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em]">
          <span>Patientfall</span>
          <span>Datum</span>
          <span>Tid</span>
          <span>Poäng</span>
          <span>Status</span>
          <span />
        </div>

        <div className="divide-y divide-[#1d3557]/[0.04]">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_100px] gap-3 md:gap-4 md:items-center px-4 md:px-6 py-4 hover:bg-[#F9FAFB] transition-colors duration-200"
            >
              {/* Title + specialty */}
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-[#1d3557] truncate">
                  {s.case_title}
                </h3>
                <p className="text-[12px] text-[#94A3B8]">{s.case_specialty}</p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-[13px] text-[#94A3B8]">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                {new Date(s.started_at).toLocaleDateString("sv-SE")}
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1.5 text-[13px] text-[#94A3B8]">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                {formatDuration(s.started_at, s.submitted_at ?? s.evaluated_at)}
              </div>

              {/* Grade + score */}
              <div className="flex flex-col">
                {s.grade !== null ? (
                  <>
                    <span className="text-[13px] font-bold text-[#1d3557]">{s.grade}</span>
                    <span className="text-[11px] text-[#94A3B8] font-mono">
                      {Math.round((s.total_score ?? 0) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-[#94A3B8]">—</span>
                )}
              </div>

              {/* Status */}
              <div>
                <SessionStatusBadge status={s.status} />
              </div>

              {/* Action */}
              <div className="flex items-center gap-1">
                <Link
                  href={s.status === "evaluated" ? `/evaluations/${s.id}` : `/sessions/${s.id}`}
                  className="px-3 md:px-4 py-2 bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#1d3557] text-[12px] font-semibold rounded-xl hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  {s.status === "evaluated" ? "Visa" : "Fortsätt"}
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
                <DeleteSessionButton sessionId={s.id} caseTitle={s.case_title} />
              </div>
            </div>
          ))}
        </div>
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
