import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  TrendingUp,
  Calendar,
  Award,
  Sparkles,
} from "lucide-react";

import { getOrCreateUser } from "@/lib/auth/user";
import {
  getMonthlyUsage,
  getRecentSessions,
  getAverageScore,
  getSessionStreak,
} from "@/lib/db/dashboard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TopBar } from "@/components/dashboard/TopBar";

const FREE_LIMIT = 3;

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
  const remaining = Math.max(FREE_LIMIT - sessionsUsed, 0);

  const firstName =
    user.full_name?.split(" ")[0] ?? user.email.split("@")[0];

  return (
    <>
      <TopBar title="Översikt" />
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6">
        {/* ---- Header ---- */}
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-semibold mb-2">
            Hej, {firstName} 👋
          </h1>
          <p className="text-muted-foreground">
            Fortsätt utveckla ditt kliniska resonemang
          </p>
        </div>

        <div className="max-w-7xl mx-auto w-full space-y-8">
          {/* ---- Stats Grid ---- */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Usage Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Månadens användning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold">
                      {sessionsUsed}
                    </span>
                    <span className="text-muted-foreground">
                      / {isFree ? FREE_LIMIT : "∞"} fall
                    </span>
                  </div>
                  {isFree && (
                    <>
                      <Progress
                        value={(sessionsUsed / FREE_LIMIT) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {remaining} fall kvar denna månad
                      </p>
                    </>
                  )}
                  {!isFree && (
                    <p className="text-xs text-muted-foreground">
                      Obegränsat med Pro-planen
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Average Score Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Genomsnittlig poäng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-emerald-600">
                      {avgScore}
                    </span>
                    <span className="text-muted-foreground">/ 100</span>
                  </div>
                  {avgScore > 0 && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span>Baserat på alla sessioner</span>
                    </div>
                  )}
                  {avgScore === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Ingen poäng ännu
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aktiv svit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold">{streak}</span>
                    <span className="text-muted-foreground">dagar</span>
                  </div>
                  {streak > 0 ? (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <Award className="h-4 w-4" />
                      <span>Bra jobbat!</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Starta ett fall idag!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ---- Main CTA ---- */}
          <Card className="border-2 border-[#0f766e] bg-gradient-to-br from-[#ecfdf5] to-white dark:from-emerald-950/20 dark:to-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Starta nytt patientfall
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Välj ett fall från biblioteket och börja träna
                  </CardDescription>
                </div>
                <Sparkles className="h-6 w-6 text-[#0f766e]" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/cases">
                <Button size="lg">
                  Bläddra patientfall
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* ---- Recent Sessions ---- */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Senaste sessioner</h2>
              <Link href="/sessions">
                <Button variant="ghost" size="sm">
                  Visa alla
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {sessions.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p className="mb-1">
                    Inga sessioner ännu — starta ditt första patientfall.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">
                            {session.case_title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(
                                session.started_at
                              ).toLocaleDateString("sv-SE", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {session.status === "evaluated" && (
                            <div className="text-right">
                              <div className="text-2xl font-semibold text-emerald-600">
                                {/* Score not available in RecentSession type — show status */}
                              </div>
                            </div>
                          )}
                          {session.status === "active" && (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
                              Pågående
                            </span>
                          )}
                          {session.status === "evaluated" && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200">
                              Klar
                            </span>
                          )}
                          {session.status === "submitted" && (
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
                              Inskickad
                            </span>
                          )}
                          <Link
                            href={
                              session.status === "evaluated"
                                ? `/evaluations/${session.id}`
                                : `/sessions/${session.id}`
                            }
                          >
                            <Button variant="ghost" size="sm">
                              {session.status === "evaluated"
                                ? "Se resultat"
                                : "Fortsätt"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ---- Upgrade CTA (free users only) ---- */}
          {isFree && (
            <Card className="border-border bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white">
              <CardHeader>
                <CardTitle className="text-white">
                  Uppgradera till Pro
                </CardTitle>
                <CardDescription className="text-white/90">
                  Få obegränsad tillgång till alla patientfall och avancerad
                  feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-white/90">
                      ✓ Obegränsade fall · ✓ Avancerad AI-feedback · ✓
                      Progressanalys
                    </p>
                    <p className="text-2xl font-semibold">299 kr/månad</p>
                  </div>
                  <Link href="/billing">
                    <Button variant="secondary" size="lg">
                      Uppgradera nu
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}