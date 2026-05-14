import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Flame,
  Target,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sessioner",
};

import { getOrCreateUser } from "@/lib/auth/user";
import { getSessionsPage, getSessionStats } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { FadeUp, Stagger, StaggerItem } from "@/components/dashboard/MotionWrappers";
import { SessionsList } from "@/components/dashboard/SessionsList";

export default async function SessionsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const [firstPage, stats] = await Promise.all([
    getSessionsPage(user.user_id, null),
    getSessionStats(user.user_id),
  ]);

  const statCards = [
    {
      label: "Totalt sessioner",
      value: stats.total,
      icon: Calendar,
      iconBg: "bg-[#457b9d]/[0.06]",
      iconColor: "text-[#457b9d]",
    },
    {
      label: "Genomförda",
      value: stats.completed,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Pågående",
      value: stats.inProgress,
      icon: Flame,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Snittpoäng",
      value: stats.avgScorePct,
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
          {statCards.map((s) => (
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

        {/* Sessions List (paginated, client-side load more) */}
        <FadeUp delay={0.25}>
          <SessionsList
            initialSessions={firstPage.sessions}
            initialNextCursor={firstPage.nextCursor}
          />
        </FadeUp>
      </div>
    </>
  );
}
