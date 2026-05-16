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
import { EvaluationFeedback } from "@/components/dashboard/EvaluationFeedback";
import {
  getScoreBadgeStyle,
  getScoreBarColor,
  getScoreLabel,
  getScoreTextColor,
} from "@/lib/ui/scores";

interface EvaluationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { id: sessionId } = await params;
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const ev = await getEvaluationBySession(sessionId, user.user_id);
  if (!ev) notFound();

  const AREA_LABELS: Record<string, string> = {
    anamnes: "Anamnes",
    undersokningar: "Undersökningar",
    kommunikation: "Kommunikation",
    klinisk_resonemang: "Kliniskt resonemang",
    bedomning_och_atgard: "Bedömning & åtgärd",
  };
  const scores = ev.rubric_scores.map((a) => ({
    category: AREA_LABELS[a.area] ?? a.area,
    score: Math.round(a.raw_score * 100),
    weight: a.weight,
  }));
  const totalPct = Math.round(ev.total_score * 100);

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
            <div className={`text-6xl md:text-7xl font-extrabold font-mono mb-3 ${getScoreTextColor(totalPct)}`}>
              {totalPct}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[12px] font-semibold border ${getScoreBadgeStyle(totalPct)}`}>
              {ev.grade}
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
            {scores.map((item) => (
              <StaggerItem
                key={item.category}
                className="bg-white rounded-2xl p-5 border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)]"
              >
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-2">
                  {item.category}
                </p>
                <div className="flex items-baseline justify-between mb-2">
                  <span className={`text-2xl font-extrabold font-mono ${getScoreTextColor(item.score)}`}>
                    {item.score}
                  </span>
                  <span className="text-[13px] text-[#94A3B8]">/ 100</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1d3557]/[0.04]">
                  <div
                    className={`h-full rounded-full transition-all ${getScoreBarColor(item.score)}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </StaggerItem>
            ))}
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

        {/* Auto-fail triggers (säkerhetskritiska brister som forcerade Clear Fail) */}
        {ev.auto_fail_triggered.length > 0 && (
          <FadeUp delay={0.44} className="bg-white rounded-2xl border border-rose-200/50 shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
                Säkerhetskritiska brister (auto-fail)
              </h2>
            </div>
            <p className="text-[13px] text-[#94A3B8] mb-4">
              Dessa brister forcerade betyget till &quot;Clear Fail&quot; oavsett rubric-poäng.
            </p>
            <ul className="space-y-3">
              {ev.auto_fail_triggered.map((m, i) => (
                <li key={i} className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-[12px] text-rose-700 font-semibold uppercase tracking-wide mb-0.5">
                      {m.category.replace(/_/g, " ")}
                    </p>
                    <span className="text-[14px] text-[#1d3557]/80">{m.description}</span>
                  </div>
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

        {/* Contextual beta feedback on the grading */}
        <FadeUp delay={0.5}>
          <EvaluationFeedback sessionId={sessionId} caseTitle={ev.case_title} />
        </FadeUp>

        {/* Actions */}
        <FadeUp delay={0.54} className="flex items-center justify-center gap-3 pt-4">
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
