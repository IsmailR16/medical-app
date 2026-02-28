import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth/user";
import {
  getMonthlyUsage,
  getRecentSessions,
  getLatestEvaluations,
} from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { UsageCard } from "@/components/dashboard/UsageCard";
import { StartCaseCard } from "@/components/dashboard/StartCaseCard";
import { RecentSessionsTable } from "@/components/dashboard/RecentSessionsTable";
import { LatestEvaluationsCard } from "@/components/dashboard/LatestEvaluationsCard";
import { UpgradeCard } from "@/components/dashboard/UpgradeCard";

const FREE_LIMIT = 3;

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const [usage, sessions, evaluations] = await Promise.all([
    getMonthlyUsage(user.user_id),
    getRecentSessions(user.user_id),
    getLatestEvaluations(user.user_id),
  ]);

  const sessionsUsed = usage?.sessions_started ?? 0;
  const isFree = user.plan === "free";
  const limitReached = isFree && sessionsUsed >= FREE_LIMIT;

  const firstName =
    user.full_name?.split(" ")[0] ?? user.email.split("@")[0];

  return (
    <>
      <TopBar title="Översikt" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Hej, {firstName}
          </h2>
          <p className="text-muted-foreground">
            Välkommen tillbaka till MedSim AI.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UsageCard
            plan={user.plan}
            sessionsUsed={sessionsUsed}
            limit={FREE_LIMIT}
          />
          <StartCaseCard limitReached={limitReached} />
          {isFree && <UpgradeCard />}
        </div>

        {/* Sessions table */}
        <RecentSessionsTable sessions={sessions} />

        {/* Evaluations */}
        <LatestEvaluationsCard evaluations={evaluations} />
      </div>
    </>
  );
}