import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Target,
  Flame,
  Stethoscope,
} from "lucide-react";

import { getOrCreateUser } from "@/lib/auth/user";
import {
  getMonthlyUsage,
  getRecentSessions,
  getAverageScore,
  getSessionStreak,
} from "@/lib/db/dashboard";
import { FREE_LIMIT } from "@/lib/plans";
import { TopBar } from "@/components/dashboard/TopBar";
import { PlanCheckout } from "@/components/dashboard/PlanCheckout";
import { SurpriseMeButton } from "@/components/dashboard/SurpriseMeButton";
import { FadeUp, Stagger, StaggerItem } from "@/components/dashboard/MotionWrappers";
import { SessionStatusBadge } from "@/components/dashboard/SessionStatusBadge";

export const metadata: Metadata = {
  title: "Översikt",
};

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const [usage, sessions, avgScore, streak] = await Promise.all([
    getMonthlyUsage(user.user_id),
    getRecentSessions(user.user_id),
    getAverageScore(user.user_id),
    getSessionStreak(user.user_id),
  ]);

  const sessionsUsed = usage?.sessions_started ?? 0;
  const isFree = user.plan === "free";

  const firstName =
    user.full_name?.split(" ")[0] ?? user.email.split("@")[0];

  const usageDisplay = isFree
    ? `${sessionsUsed} / ${FREE_LIMIT}`
    : `${sessionsUsed} / ∞`;

  return (
    <>
      <PlanCheckout />
      <TopBar title="Översikt" />

      <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
        {/* Header */}
        <FadeUp className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight">
            Hej {firstName}
          </h1>
          <p className="text-[15px] text-[#94A3B8] mt-1">
            Fortsätt utveckla ditt kliniska tänkande
          </p>
        </FadeUp>

        {/* Stats Row */}
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Usage */}
          <StaggerItem className="bg-white rounded-2xl p-5 border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] hover:shadow-[0_8px_24px_-8px_rgba(29,53,87,0.1)] transition-shadow duration-300">
            <div className="w-9 h-9 rounded-xl bg-[#457b9d]/[0.06] flex items-center justify-center mb-4">
              <Calendar className="w-[18px] h-[18px] text-[#457b9d]" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1">
              Månatlig användning
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#1d3557] tracking-tight font-mono">
                {usageDisplay}
              </span>
              <span className="text-[13px] text-[#94A3B8] font-medium">fall</span>
            </div>
          </StaggerItem>

          {/* Average Score */}
          <StaggerItem className="bg-white rounded-2xl p-5 border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] hover:shadow-[0_8px_24px_-8px_rgba(29,53,87,0.1)] transition-shadow duration-300">
            <div className="w-9 h-9 rounded-xl bg-[#457b9d]/[0.06] flex items-center justify-center mb-4">
              <Target className="w-[18px] h-[18px] text-[#457b9d]" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1">
              Genomsnittligt resultat
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#1d3557] tracking-tight font-mono">
                {avgScore}
              </span>
              <span className="text-[13px] text-[#94A3B8] font-medium">/ 100</span>
            </div>
          </StaggerItem>

          {/* Streak */}
          <StaggerItem className="bg-white rounded-2xl p-5 border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] hover:shadow-[0_8px_24px_-8px_rgba(29,53,87,0.1)] transition-shadow duration-300">
            <div className="w-9 h-9 rounded-xl bg-[#e63946]/[0.06] flex items-center justify-center mb-4">
              <Flame className="w-[18px] h-[18px] text-[#e63946]" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1">
              Aktiv streak
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#1d3557] tracking-tight font-mono">
                {streak}
              </span>
              <span className="text-[13px] text-[#94A3B8] font-medium">dagar</span>
            </div>
          </StaggerItem>
        </Stagger>

        {/* Primary Action — Double-bezel card */}
        <FadeUp delay={0.25} className="mb-8">
          <div className="p-[3px] rounded-[2rem] bg-gradient-to-br from-[#457b9d]/20 to-[#a8dadc]/20 ring-1 ring-[#1d3557]/[0.04]">
            <div className="bg-[#1d3557] rounded-[calc(2rem-3px)] p-8 md:p-10 relative overflow-hidden">
              {/* Decorative blurs */}
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#457b9d]/15 blur-3xl" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-[#a8dadc]/[0.08] blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/[0.06] border border-white/[0.06] rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-[#a8dadc]" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Starta nytt patientfall
                    </h2>
                  </div>
                  <p className="text-[15px] text-white/40 mb-6 max-w-[45ch] leading-relaxed">
                    Välj ett fall från biblioteket och börja träna dina diagnostiska färdigheter.
                  </p>
                  <div className="flex gap-3">
                    <SurpriseMeButton />
                    <Link
                      href="/cases"
                      className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.1] active:scale-[0.98] backdrop-blur-sm"
                    >
                      Bläddra i fall
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:flex items-center justify-center ml-8">
                  <div className="w-36 h-36 bg-white/[0.04] rounded-full border border-white/[0.06] flex items-center justify-center">
                    <Stethoscope className="w-16 h-16 text-white/10" strokeWidth={1} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Recent Sessions */}
        <FadeUp delay={0.35} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1d3557]/[0.04]">
            <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
              Senaste sessioner
            </h2>
            <Link
              href="/sessions"
              className="text-[13px] font-semibold text-[#457b9d] hover:text-[#3a6781] transition-colors duration-300 flex items-center gap-1"
            >
              Visa alla
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-14 h-14 rounded-2xl bg-[#457b9d]/[0.06] flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-6 h-6 text-[#94A3B8]" strokeWidth={1.5} />
              </div>
              <p className="text-[15px] font-medium text-[#1d3557] mb-1">
                Inga sessioner ännu
              </p>
              <p className="text-[13px] text-[#94A3B8] mb-6">
                Starta ditt första patientfall för att börja träna
              </p>
              <Link
                href="/cases"
                className="inline-block px-5 py-2.5 bg-[#457b9d] text-white text-[13px] font-semibold rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a6781] active:scale-[0.98] shadow-[0_2px_8px_-2px_rgba(69,123,157,0.3)]"
              >
                Starta ditt första fall
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1d3557]/[0.04]">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 hover:bg-[#F9FAFB] transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold text-[#1d3557] mb-0.5 truncate">
                        {session.case_title}
                      </h3>
                      <p className="text-[12px] text-[#94A3B8]">
                        {new Date(session.started_at).toLocaleDateString(
                          "sv-SE",
                          { day: "numeric", month: "short" }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-4">
                    <SessionStatusBadge status={session.status} />

                    <Link
                      href={
                        session.status === "evaluated"
                          ? `/evaluations/${session.id}`
                          : `/sessions/${session.id}`
                      }
                      className="px-3 md:px-4 py-2 bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#1d3557] text-[12px] font-semibold rounded-xl hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap"
                    >
                      {session.status === "evaluated"
                        ? "Visa resultat"
                        : "Fortsätt"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FadeUp>

        {/* Upgrade CTA (free users only) */}
        {isFree && (
          <FadeUp delay={0.45} className="mt-8 p-[3px] rounded-2xl bg-gradient-to-r from-[#457b9d]/30 to-[#a8dadc]/30">
            <div className="bg-[#1d3557] rounded-[calc(1rem-1px)] p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-1">
                    Uppgradera till Pro
                  </h3>
                  <p className="text-[14px] text-white/50">
                    Obegränsade fall · Avancerad AI-feedback · Progressanalys
                  </p>
                </div>
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-2 bg-white text-[#1d3557] text-[13px] font-semibold rounded-xl px-5 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/90 active:scale-[0.98] shadow-[0_2px_8px_-2px_rgba(255,255,255,0.2)]"
                >
                  Uppgradera nu
                  <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </FadeUp>
        )}
      </div>
    </>
  );
}