import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth/user";
import { getPublishedCases, getMonthlyUsage } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { CaseGrid } from "@/components/dashboard/CaseGrid";
import { FREE_LIMIT } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Fallbibliotek",
};

export default async function CasesPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const [cases, usage] = await Promise.all([
    getPublishedCases(),
    getMonthlyUsage(user.user_id),
  ]);

  const sessionsUsed = usage?.sessions_started ?? 0;
  const isFree = user.plan === "free";
  const limitReached = isFree && sessionsUsed >= FREE_LIMIT;

  return (
    <>
      <TopBar title="Fallbibliotek" />
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold mb-2">Patientfall</h1>
          <p className="text-muted-foreground">
            {limitReached
              ? `Du har använt ${sessionsUsed}/${FREE_LIMIT} fall denna månad. Uppgradera till Pro för obegränsat.`
              : isFree
                ? `Välj ett patientfall att träna på — ${sessionsUsed}/${FREE_LIMIT} fall använda denna månad.`
                : "Välj ett patientfall att träna på från vårt bibliotek."}
          </p>
        </div>

        <CaseGrid cases={cases} limitReached={limitReached} />
      </div>
    </>
  );
}
