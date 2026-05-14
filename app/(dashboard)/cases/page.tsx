import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth/user";
import { getPublishedCases, getMonthlyUsage, getActiveSessionsByCase } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { CaseGrid } from "@/components/dashboard/CaseGrid";
import { FREE_LIMIT } from "@/lib/plans";
import { FadeUp } from "@/components/dashboard/MotionWrappers";

export const metadata: Metadata = {
  title: "Fallbibliotek",
};

export default async function CasesPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const [cases, usage, activeSessions] = await Promise.all([
    getPublishedCases(),
    getMonthlyUsage(user.user_id),
    getActiveSessionsByCase(user.user_id),
  ]);

  const sessionsUsed = usage?.sessions_started ?? 0;
  const isFree = user.plan === "free";
  const limitReached = isFree && sessionsUsed >= FREE_LIMIT;

  return (
    <>
      <TopBar title="Fallbibliotek" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <FadeUp className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight">
            Fallbibliotek
          </h1>
          <p className="text-[15px] text-[#94A3B8] mt-1">
            {limitReached
              ? `Du har använt ${sessionsUsed}/${FREE_LIMIT} fall denna månad. Uppgradera till Pro för obegränsat.`
              : isFree
                ? `Välj ett patientfall att träna på — ${sessionsUsed}/${FREE_LIMIT} fall använda denna månad.`
                : "Bläddra och välj patientfall att träna på"}
          </p>
        </FadeUp>

        <FadeUp delay={0.15}>
          <CaseGrid cases={cases} limitReached={limitReached} activeSessions={activeSessions} />
        </FadeUp>
      </div>
    </>
  );
}
