import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Utvärderingar",
};

import { getOrCreateUser } from "@/lib/auth/user";
import { getEvaluationAggregates, getEvaluationsPage } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { FadeUp, Stagger, StaggerItem } from "@/components/dashboard/MotionWrappers";
import { CategoryBars } from "@/components/dashboard/CategoryBars";
import { EvaluationsList } from "@/components/dashboard/EvaluationsList";

const AREA_LABELS: Record<string, string> = {
  anamnes: "Anamnes",
  undersokningar: "Undersökningar",
  kommunikation: "Kommunikation",
  klinisk_resonemang: "Kliniskt resonemang",
  bedomning_och_atgard: "Bedömning & åtgärd",
};

export default async function EvaluationsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const [aggregates, firstPage] = await Promise.all([
    getEvaluationAggregates(user.user_id),
    getEvaluationsPage(user.user_id, null),
  ]);

  const { totalCases, averagePct, totalMinutes, categoryData: rawCategoryData } = aggregates;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Map area key → label for UI
  const categoryData = rawCategoryData.map((c) => ({
    category: AREA_LABELS[c.area] ?? c.area,
    score: c.score,
    trend: c.trend,
    trendUp: c.trendUp,
  }));

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

        {/* Evaluations List — paginated, client-side load more */}
        <FadeUp delay={0.25}>
          {totalCases > 0 ? (
            <EvaluationsList
              initialEvaluations={firstPage.evaluations}
              initialNextCursor={firstPage.nextCursor}
            />
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
