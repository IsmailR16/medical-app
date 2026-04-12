import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  Stethoscope,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sessioner",
};

import { getOrCreateUser } from "@/lib/auth/user";
import { getAllSessions } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { FadeUp, Stagger, StaggerItem } from "@/components/dashboard/MotionWrappers";

const statusLabel: Record<string, string> = {
  active: "Pågående",
  submitted: "Inskickad",
  evaluated: "Avslutad",
};

const statusStyle: Record<string, string> = {
  active: "bg-amber-50 text-amber-700 border-amber-200/50",
  submitted: "bg-blue-50 text-blue-700 border-blue-200/50",
  evaluated: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
};

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

export default async function SessionsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const sessions = await getAllSessions(user.user_id);

  /* ---- stats ---- */
  const total = sessions.length;
  const completed = sessions.filter(
    (s) => s.status === "evaluated" || s.status === "submitted"
  ).length;
  const inProgress = sessions.filter((s) => s.status === "active").length;
  const scored = sessions.filter((s) => s.overall_score !== null);
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) /
            scored.length
        )
      : 0;

  /* ---- helpers ---- */
  function formatDuration(startedAt: string, endAt: string | null): string {
    if (!endAt) return "Pågående";
    const ms =
      new Date(endAt).getTime() - new Date(startedAt).getTime();
    const mins = Math.round(ms / 60000);
    return `${mins} min`;
  }

  const stats = [
    {
      label: "Totalt sessioner",
      value: total,
      icon: Calendar,
      iconBg: "bg-[#457b9d]/[0.06]",
      iconColor: "text-[#457b9d]",
    },
    {
      label: "Genomförda",
      value: completed,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Pågående",
      value: inProgress,
      icon: Flame,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Snittpoäng",
      value: avgScore,
      icon: Target,
      iconBg: "bg-[#457b9d]/[0.06]",
      iconColor: "text-[#457b9d]",
    },
  ];

  return (
    <>
      <TopBar title="Mina sessioner" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <FadeUp className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight">
              Mina sessioner
            </h1>
            <p className="text-[15px] text-[#94A3B8] mt-1">
              Se alla dina genomförda och pågående sessioner
            </p>
          </div>
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 bg-[#1d3557] text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#162a45] active:scale-[0.98] shadow-[0_2px_8px_-2px_rgba(29,53,87,0.3)]"
          >
            Nytt fall
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </FadeUp>

        {/* Stats Row */}
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <StaggerItem
              key={s.label}
              className="bg-white rounded-2xl p-5 border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] hover:shadow-[0_8px_24px_-8px_rgba(29,53,87,0.1)] transition-shadow duration-300"
            >
              <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                <s.icon className={`w-[18px] h-[18px] ${s.iconColor}`} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1">
                {s.label}
              </p>
              <span className="text-2xl font-extrabold text-[#1d3557] tracking-tight font-mono">
                {s.value}
              </span>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Sessions List */}
        <FadeUp delay={0.25}>
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#457b9d]/[0.06] flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-6 h-6 text-[#94A3B8]" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-medium text-[#1d3557] mb-1">
              Inga sessioner ännu
            </p>
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
        ) : (
          <div className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)]">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-[#1d3557]/[0.04] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em]">
              <span>Patientfall</span>
              <span>Svårighetsgrad</span>
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
                  className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 md:items-center px-4 md:px-6 py-4 hover:bg-[#F9FAFB] transition-colors duration-200"
                >
                  {/* Title + specialty */}
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-[#1d3557] truncate">
                      {s.case_title}
                    </h3>
                    <p className="text-[12px] text-[#94A3B8]">
                      {s.case_specialty}
                    </p>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                        difficultyStyle[s.case_difficulty] ?? "bg-zinc-50 text-zinc-500 border-zinc-200/50"
                      }`}
                    >
                      {difficultyLabel[s.case_difficulty] ?? s.case_difficulty}
                    </span>
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

                  {/* Score */}
                  <div>
                    {s.overall_score !== null ? (
                      <span className="text-lg font-extrabold text-[#1d3557] font-mono">
                        {s.overall_score}
                      </span>
                    ) : (
                      <span className="text-[#94A3B8]">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                        statusStyle[s.status] ?? "bg-zinc-50 text-zinc-500 border-zinc-200/50"
                      }`}
                    >
                      {s.status === "active" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                      )}
                      {s.status === "evaluated" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      )}
                      {statusLabel[s.status] ?? s.status}
                    </span>
                  </div>

                  {/* Action */}
                  <div>
                    <Link
                      href={
                        s.status === "evaluated"
                          ? `/evaluations/${s.id}`
                          : `/sessions/${s.id}`
                      }
                      className="px-3 md:px-4 py-2 bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#1d3557] text-[12px] font-semibold rounded-xl hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap inline-flex items-center gap-1.5"
                    >
                      {s.status === "evaluated" ? "Visa" : "Fortsätt"}
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </FadeUp>
      </div>
    </>
  );
}
