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

import { getOrCreateUser } from "@/lib/auth/user";
import { getEvaluatedSessions } from "@/lib/db/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopBar } from "@/components/dashboard/TopBar";

/* ---- Helpers ---- */

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 75) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-rose-600 bg-rose-50 border-rose-200";
}

function getScoreBadgeColor(score: number) {
  if (score >= 90) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (score >= 75) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Utmärkt";
  if (score >= 75) return "Bra";
  if (score >= 60) return "Godkänt";
  return "Behöver förbättring";
}

function bestCategory(evaluations: { history_taking_score: number; physical_exam_score: number; diagnosis_score: number; treatment_score: number }[]): string {
  if (evaluations.length === 0) return "-";
  const totals = { Anamnesupptagning: 0, Undersökning: 0, Diagnos: 0, Behandling: 0 };
  for (const ev of evaluations) {
    totals.Anamnesupptagning += ev.history_taking_score;
    totals.Undersökning += ev.physical_exam_score;
    totals.Diagnos += ev.diagnosis_score;
    totals.Behandling += ev.treatment_score;
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
}

export default async function EvaluationsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const evaluations = await getEvaluatedSessions(user.user_id);

  /* ---- Stats ---- */
  const totalCases = evaluations.length;
  const averageScore =
    totalCases > 0
      ? (
          evaluations.reduce((sum, e) => sum + e.overall_score, 0) / totalCases
        ).toFixed(1)
      : "0";
  const totalMinutes = evaluations.reduce(
    (sum, e) => sum + (e.duration_min ?? 0),
    0
  );
  const totalHours = (totalMinutes / 60).toFixed(1);
  const best = bestCategory(evaluations);

  return (
    <>
      <TopBar title="Utvärderingar" />
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold mb-2">
            Resultat &amp; Utvärderingar
          </h1>
          <p className="text-muted-foreground">
            Översikt över dina genomförda fall och prestationer
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Genomförda fall
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{totalCases}</div>
              <p className="text-xs text-muted-foreground mt-1">Totalt antal</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Genomsnitt
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-emerald-600">
                {averageScore}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Medelpoäng</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Övningstid
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{totalHours}h</div>
              <p className="text-xs text-muted-foreground mt-1">Totalt</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bästa område
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">{best}</div>
              <p className="text-xs text-muted-foreground mt-1">Högst poäng</p>
            </CardContent>
          </Card>
        </div>

        {/* Evaluations List */}
        {evaluations.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Alla utvärderingar</h2>

            <div className="space-y-4">
              {evaluations.map((ev) => (
                <Card
                  key={ev.id}
                  className="border-border hover:border-[#0f766e] transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Score Circle */}
                      <div className="flex-shrink-0">
                        <div
                          className={`h-20 w-20 rounded-full border-4 flex items-center justify-center ${getScoreColor(ev.overall_score)}`}
                        >
                          <div className="text-2xl font-bold">
                            {ev.overall_score}
                          </div>
                        </div>
                      </div>

                      {/* Case Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {ev.case_title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <Badge variant="outline" className="font-normal">
                                {ev.case_specialty}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(ev.started_at).toLocaleDateString(
                                  "sv-SE"
                                )}
                              </span>
                              {ev.duration_min !== null && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {ev.duration_min} min
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getScoreBadgeColor(ev.overall_score)} whitespace-nowrap`}
                          >
                            {getScoreLabel(ev.overall_score)}
                          </Badge>
                        </div>

                        {/* Mini Score Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="text-sm">
                            <div className="text-muted-foreground text-xs mb-1">
                              Anamnes
                            </div>
                            <div className="font-semibold">
                              {ev.history_taking_score}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground text-xs mb-1">
                              Undersökning
                            </div>
                            <div className="font-semibold">
                              {ev.physical_exam_score}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground text-xs mb-1">
                              Diagnos
                            </div>
                            <div className="font-semibold">
                              {ev.diagnosis_score}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground text-xs mb-1">
                              Behandling
                            </div>
                            <div className="font-semibold">
                              {ev.treatment_score}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0 lg:ml-4">
                        <Link href={`/evaluations/${ev.session_id}`}>
                          <Button variant="outline" className="w-full lg:w-auto">
                            Se detaljer
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Inga utvärderingar än
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Genomför ditt första fall för att se dina resultat och
                utvärderingar här.
              </p>
              <Link href="/cases">
                <Button>Börja öva</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
