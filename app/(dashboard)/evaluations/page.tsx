import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Utvärderingar",
};

import { getOrCreateUser } from "@/lib/auth/user";
import { getEvaluatedSessions, type EvaluationListItem } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { FadeUp, Stagger, StaggerItem } from "@/components/dashboard/MotionWrappers";
import { CategoryBars } from "@/components/dashboard/CategoryBars";
import {
  getScoreBadgeStyle,
  getScoreCircleStyle,
} from "@/lib/ui/scores";

const RUBRIC_AREAS = [
  { key: "anamnes", label: "Anamnes" },
  { key: "undersokningar", label: "Undersökningar" },
  { key: "kommunikation", label: "Kommunikation" },
  { key: "klinisk_resonemang", label: "Kliniskt resonemang" },
  { key: "bedomning_och_atgard", label: "Bedömning & åtgärd" },
] as const;

/** Extract a 0-100 score per rubric-area for one evaluation, or 0 if missing. */
function areaScore(ev: EvaluationListItem, areaKey: string): number {
  const a = ev.rubric_scores.find((x) => x.area === areaKey);
  return a ? Math.round(a.raw_score * 100) : 0;
}

export default async function EvaluationsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const evaluations = await getEvaluatedSessions(user.user_id);

  /* ---- Stats ---- */
  const totalCases = evaluations.length;
  const averagePct =
    totalCases > 0
      ? Math.round(
          (evaluations.reduce((sum, e) => sum + e.total_score, 0) / totalCases) * 100
        )
      : 0;
  const totalMinutes = evaluations.reduce(
    (sum, e) => sum + (e.duration_min ?? 0),
    0
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  /* ---- Category averages from rubric_scores ---- */
  const categoryData = RUBRIC_AREAS.map(({ key, label }) => {
    const avg =
      totalCases > 0
        ? Math.round(evaluations.reduce((s, e) => s + areaScore(e, key), 0) / totalCases)
        : 0;

    let trend: string | null = null;
    let trendUp = true;

    if (totalCases >= 4) {
      const half = Math.floor(totalCases / 2);
      const older = evaluations.slice(half);
      const newer = evaluations.slice(0, half);
      const olderAvg = older.reduce((s, e) => s + areaScore(e, key), 0) / older.length;
      const newerAvg = newer.reduce((s, e) => s + areaScore(e, key), 0) / newer.length;
      const diff = Math.round(newerAvg - olderAvg);
      trend = diff >= 0 ? `+${diff}` : `${diff}`;
      trendUp = diff >= 0;
    }

    return { category: label, score: avg, trend, trendUp };
  });

  const best =
    totalCases > 0
      ? [...categoryData].sort((a, b) => b.score - a.score)[0].category
      : "-";

  const stats = [
    { label: "Genomförda fall", value: totalCases, icon: Target, iconBg: "bg-[#457b9d]/[0.06]", iconColor: "text-[#457b9d]", suffix: "totalt" },
    { label: "Genomsnitt", value: averagePct, icon: BarChart3, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", suffix: "%" },
    { label: "Övningstid", value: `${totalHours}h`, icon: Clock, iconBg: "bg-[#457b9d]/[0.06]", iconColor: "text-[#457b9d]", suffix: "totalt" },
    { label: "Bästa område", value: best, icon: Award, iconBg: "bg-amber-50", iconColor: "text-amber-600", suffix: "högst poäng", isText: true },
  ];

  /* ---- Recommendations ---- */
  const sorted = [...categoryData].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  return (
    <>
      <TopBar title="Utvärderingar" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <FadeUp className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight">
            Resultat &amp; Utvärderingar
          </h1>
          <p className="text-[15px] text-[#94A3B8] mt-1">
            Översikt över dina genomförda fall och prestationer
          </p>
        </FadeUp>

        {/* Stats Row */}
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <div className="flex items-baseline gap-1.5">
                <span className={`${s.isText ? "text-sm" : "text-2xl font-mono"} font-extrabold text-[#1d3557] tracking-tight`}>
                  {s.value}
                </span>
                <span className="text-[13px] text-[#94A3B8] font-medium">{s.suffix}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* ── Övergripande prestation ── */}
        {totalCases > 0 && (
          <FadeUp delay={0.2} className="mb-8">
            <div className="p-[3px] rounded-[2rem] bg-gradient-to-br from-[#457b9d]/20 to-[#a8dadc]/20 ring-1 ring-[#1d3557]/[0.04]">
              <div className="bg-[#1d3557] rounded-[calc(2rem-3px)] p-8 md:p-10 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#457b9d]/15 blur-3xl" />
                <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-[#a8dadc]/[0.08] blur-2xl" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-white/[0.06] border border-white/[0.06] rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-[#a8dadc]" strokeWidth={1.5} />
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        Övergripande prestation
                      </h2>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-extrabold text-white tracking-tight font-mono">
                        {averagePct}
                      </span>
                      <span className="text-xl text-white/30 font-medium">%</span>
                    </div>
                    <p className="text-[14px] text-white/40">Genomsnitt över alla kategorier</p>
                  </div>
                  <div className="hidden lg:flex items-center justify-center">
                    <div className="w-36 h-36 bg-white/[0.04] rounded-full border border-white/[0.06] flex items-center justify-center">
                      <Target className="w-16 h-16 text-white/10" strokeWidth={1} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        )}

        {/* ── Prestation per kategori ── */}
        {totalCases > 0 && (
          <FadeUp delay={0.28} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] mb-8">
            <div className="px-6 py-5 border-b border-[#1d3557]/[0.04]">
              <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
                Prestation per kategori
              </h2>
            </div>
            <CategoryBars categories={categoryData} />
          </FadeUp>
        )}

        {/* ── Rekommendationer ── */}
        {totalCases > 0 && (
          <FadeUp delay={0.34} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] mb-8">
            <div className="px-6 py-5 border-b border-[#1d3557]/[0.04]">
              <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">Rekommendationer</h2>
            </div>
            <div className="p-6 space-y-3">
              {weakest && weakest.score < 80 && (
                <div className="p-4 bg-[#e63946]/[0.03] border border-[#e63946]/[0.08] rounded-xl">
                  <h3 className="text-[14px] font-semibold text-[#1d3557] mb-1">
                    Fokusera på {weakest.category.toLowerCase()}
                  </h3>
                  <p className="text-[13px] text-[#64748B] leading-relaxed">
                    Din prestation inom {weakest.category.toLowerCase()} ligger på {weakest.score}%. Överväg att gå igenom fall som fokuserar på detta färdighetsområde.
                  </p>
                </div>
              )}
              {strongest && strongest.score > 0 && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200/30 rounded-xl">
                  <h3 className="text-[14px] font-semibold text-[#1d3557] mb-1">
                    Bra framsteg inom {strongest.category.toLowerCase()}
                  </h3>
                  <p className="text-[13px] text-[#64748B] leading-relaxed">
                    Du presterar starkast inom {strongest.category.toLowerCase()} med {strongest.score}%. Fortsätt träna för att behålla denna nivå.
                  </p>
                </div>
              )}
            </div>
          </FadeUp>
        )}

        {/* Evaluations List */}
        <FadeUp delay={0.25}>
        {evaluations.length > 0 ? (
          <div>
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
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#457b9d]/[0.06] flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-[#94A3B8]" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-medium text-[#1d3557] mb-1">
              Inga utvärderingar än
            </p>
            <p className="text-[13px] text-[#94A3B8] mb-6 max-w-sm mx-auto">
              Genomför ditt första fall för att se dina resultat och utvärderingar här.
            </p>
            <Link
              href="/cases"
              className="inline-block px-5 py-2.5 bg-[#457b9d] text-white text-[13px] font-semibold rounded-xl transition-all duration-300 hover:bg-[#3a6781] active:scale-[0.98] shadow-[0_2px_8px_-2px_rgba(69,123,157,0.3)]"
            >
              Börja öva
            </Link>
          </div>
        )}
        </FadeUp>
      </div>
    </>
  );
}
