import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth/user";
import { getPublishedCases, getMonthlyUsage } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { CaseGrid } from "@/components/dashboard/CaseGrid";

const FREE_LIMIT = 3;

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
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Välj ett patientfall
          </h2>
          <p className="text-muted-foreground">
            {limitReached
              ? `Du har använt ${sessionsUsed}/${FREE_LIMIT} fall denna månad. Uppgradera till Pro för obegränsat.`
              : isFree
                ? `${sessionsUsed}/${FREE_LIMIT} fall använda denna månad.`
                : "Obegränsat antal fall med din Pro-plan."}
          </p>
        </div>

        <CaseGrid cases={cases} limitReached={limitReached} />
      </div>
    </>
  );
}
