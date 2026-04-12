import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Utvärdering",
};

import { getOrCreateUser } from "@/lib/auth/user";
import { getEvaluationBySession } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { FadeUp, Stagger, StaggerItem } from "@/components/dashboard/MotionWrappers";

interface EvaluationPageProps {
  params: Promise<{ id: string }>;
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-600";
  if (score >= 75) return "text-amber-600";
  return "text-rose-600";
}

function getScoreBadgeStyle(score: number) {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
  if (score >= 75) return "bg-amber-50 text-amber-700 border-amber-200/50";
  return "bg-rose-50 text-rose-700 border-rose-200/50";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Utmärkt";
  if (score >= 75) return "Bra";
  if (score >= 60) return "Godkänt";
  return "Behöver förbättring";
}

function getBarColor(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { id: sessionId } = await params;
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const ev = await getEvaluationBySession(sessionId, user.user_id);
  if (!ev) notFound();

  const scores = [
    { category: "Anamnesupptagning", score: ev.history_taking_score },
    { category: "Fysikalisk undersökning", score: ev.physical_exam_score },
    { category: "Diagnos", score: ev.diagnosis_score },
    { category: "Behandlingsplan", score: ev.treatment_score },
    { category: "Kliniskt resonemang", score: ev.reasoning_score },
  ];

  return (
    <>
      <TopBar title="Utvärdering" />
      <div className="p-6 md:p-10 max-w-[1000px] mx-auto w-full space-y-6">
        {/* Back */}
        <FadeUp>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#457b9d] hover:text-[#3a6781] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Tillbaka till sessioner
        </Link>
        </FadeUp>

        {/* Header */}
        <FadeUp delay={0.08} className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight mb-1">
              Utvärdering klar!
            </h1>
            <p className="text-[15px] text-[#94A3B8]">
              {ev.case_title} &bull; {ev.case_specialty}
            </p>
          </div>
        </FadeUp>

        {/* Overall Score */}
        <FadeUp delay={0.16} className="p-[3px] rounded-[2rem] bg-gradient-to-br from-[#457b9d]/20 to-[#a8dadc]/20 ring-1 ring-[#1d3557]/[0.04]">
          <div className="bg-white rounded-[calc(2rem-3px)] py-8 text-center">
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-2">
              Totalpoäng
            </p>
            <div className={`text-6xl md:text-7xl font-extrabold font-mono mb-3 ${getScoreColor(ev.overall_score)}`}>
              {ev.overall_score}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[12px] font-semibold border ${getScoreBadgeStyle(ev.overall_score)}`}>
              {getScoreLabel(ev.overall_score)}
            </span>
            <div className="mt-5 text-[13px] text-[#94A3B8]">
              Genomförd: {new Date(ev.created_at).toLocaleDateString("sv-SE")}
            </div>
          </div>
        </FadeUp>

        {/* Score Breakdown */}
        <FadeUp delay={0.24}>
          <h2 className="text-lg font-bold text-[#1d3557] tracking-tight mb-4">
            Detaljerad bedömning
          </h2>
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scores.map((item) => {
              const pct = Math.round((item.score / 100) * 100);
              return (
                <StaggerItem
                  key={item.category}
                  className="bg-white rounded-2xl p-5 border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)]"
                >
                  <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-2">
                    {item.category}
                  </p>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className={`text-2xl font-extrabold font-mono ${getScoreColor(item.score)}`}>
                      {item.score}
                    </span>
                    <span className="text-[13px] text-[#94A3B8]">/ 100</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1d3557]/[0.04]">
                    <div
                      className={`h-full rounded-full transition-all ${getBarColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </FadeUp>

        {/* Summary */}
        {ev.summary && (
          <FadeUp delay={0.32} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] p-6">
            <h2 className="text-lg font-bold text-[#1d3557] tracking-tight mb-3">
              Sammanfattning
            </h2>
            <p className="text-[14px] text-[#1d3557]/80 leading-relaxed">{ev.summary}</p>
          </FadeUp>
        )}

        {/* Strengths */}
        {ev.strengths.length > 0 && (
          <FadeUp delay={0.36} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">Styrkor</h2>
            </div>
            <ul className="space-y-3">
              {ev.strengths.map((s: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[14px] text-[#1d3557]/80">{s}</span>
                </li>
              ))}
            </ul>
          </FadeUp>
        )}

        {/* Improvements */}
        {ev.improvements.length > 0 && (
          <FadeUp delay={0.40} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">Förbättringsområden</h2>
            </div>
            <ul className="space-y-3">
              {ev.improvements.map((item: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[14px] text-[#1d3557]/80">{item}</span>
                </li>
              ))}
            </ul>
          </FadeUp>
        )}

        {/* Missed Findings */}
        {ev.missed_findings.length > 0 && (
          <FadeUp delay={0.44} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">Missade fynd</h2>
            </div>
            <ul className="space-y-3">
              {ev.missed_findings.map((finding: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[14px] text-[#1d3557]/80">{finding}</span>
                </li>
              ))}
            </ul>
          </FadeUp>
        )}

        {/* Correct Answer */}
        {ev.hidden_diagnosis && (
          <FadeUp delay={0.48} className="space-y-4">
            <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
              Korrekt bedömning och behandling
            </h2>
            <div className="bg-[#F9FAFB] rounded-2xl border border-[#1d3557]/[0.06] p-6">
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-2">
                Diagnos
              </p>
              <p className="text-[14px] font-semibold text-[#1d3557] mb-3">{ev.hidden_diagnosis}</p>
              {ev.diagnosis_correct ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/50">
                  <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={1.5} />
                  Du hade rätt diagnos
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200/50">
                  <AlertCircle className="w-3 h-3 mr-1" strokeWidth={1.5} />
                  Du missade rätt diagnos
                </span>
              )}
            </div>
          </FadeUp>
        )}

        {/* Actions */}
        <FadeUp delay={0.52} className="flex items-center justify-center gap-3 pt-4">
          <Link
            href={`/sessions/${sessionId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#1d3557] text-[13px] font-semibold rounded-xl hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
            Se sessionen
          </Link>
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 bg-[#1d3557] text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#162a45] active:scale-[0.98] shadow-[0_2px_8px_-2px_rgba(29,53,87,0.3)]"
          >
            Välj nytt fall
          </Link>
        </FadeUp>
      </div>
    </>
  );
}
