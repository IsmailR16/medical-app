import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { getOrCreateUser } from "@/lib/auth/user";
import { getEvaluationBySession } from "@/lib/db/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { TopBar } from "@/components/dashboard/TopBar";

interface EvaluationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const { id: sessionId } = await params;
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const ev = await getEvaluationBySession(sessionId, user.user_id);
  if (!ev) notFound();

  /* ---- helpers ---- */
  function getScoreColor(score: number) {
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-amber-600";
    return "text-rose-600";
  }

  function getScoreLabel(score: number) {
    if (score >= 90) return "Utmärkt";
    if (score >= 75) return "Bra";
    if (score >= 60) return "Godkänt";
    return "Behöver förbättring";
  }

  const scores = [
    { category: "Anamnesupptagning", score: ev.history_taking_score },
    { category: "Fysikalisk undersökning", score: ev.physical_exam_score },
    { category: "Diagnos", score: ev.diagnosis_score },
    { category: "Behandlingsplan", score: ev.treatment_score },
    { category: "Kliniskt resonemang", score: ev.reasoning_score },
  ];

  return (
    <>
      <TopBar title="Utvärdering" />
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Back */}
      <Link href="/sessions">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tillbaka till sessioner
        </Button>
      </Link>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-4xl font-semibold mb-2">Utvärdering klar!</h1>
          <p className="text-lg text-muted-foreground">
            {ev.case_title} &bull; {ev.case_specialty}
          </p>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="border-2 border-[#0f766e] shadow-lg">
        <CardContent className="pt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Totalpoäng</p>
          <div
            className={`text-7xl font-bold mb-2 ${getScoreColor(
              ev.overall_score
            )}`}
          >
            {ev.overall_score}
          </div>
          <Badge
            variant="outline"
            className="text-base bg-emerald-100 text-emerald-700 border-emerald-200"
          >
            {getScoreLabel(ev.overall_score)}
          </Badge>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <span>
              Genomförd:{" "}
              {new Date(ev.created_at).toLocaleDateString("sv-SE")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Detaljerad bedömning</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scores.map((item, index) => (
            <ScoreCard
              key={index}
              category={item.category}
              score={item.score}
            />
          ))}
        </div>
      </div>

      {/* Summary */}
      {ev.summary && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sammanfattning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{ev.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {ev.strengths.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle>Styrkor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {ev.strengths.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {ev.improvements.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle>Förbättringsområden</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {ev.improvements.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Missed Findings */}
      {ev.missed_findings.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-rose-600" />
              </div>
              <CardTitle>Missade fynd</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {ev.missed_findings.map((finding, i) => (
                <li key={i} className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Correct Answer */}
      {ev.hidden_diagnosis && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Korrekt bedömning och behandling
          </h2>

          <Card className="border-border bg-accent/30">
            <CardHeader>
              <CardTitle className="text-base">Diagnos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{ev.hidden_diagnosis}</p>
              {ev.diagnosis_correct ? (
                <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Du hade rätt diagnos
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="mt-2 bg-rose-100 text-rose-700 border-rose-200"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Du missade rätt diagnos
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Link href={`/sessions/${sessionId}`}>
          <Button variant="outline" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Se sessionen
          </Button>
        </Link>
        <Link href="/cases">
          <Button size="lg">Välj nytt fall</Button>
        </Link>
      </div>
    </div>
    </>
  );
}
