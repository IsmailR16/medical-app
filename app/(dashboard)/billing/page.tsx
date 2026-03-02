import { redirect } from "next/navigation";
import { Check, Crown, Zap } from "lucide-react";

import { getOrCreateUser } from "@/lib/auth/user";
import { getMonthlyUsage, currentPeriod } from "@/lib/db/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BillingActions from "./billing-actions";

export default async function BillingPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const usage = await getMonthlyUsage(user.user_id);
  const usedCases = usage?.sessions_started ?? 0;
  const isPro = user.plan === "pro" || user.plan === "institution";
  const totalCases = isPro ? Infinity : 3;
  const progressValue = isPro ? 0 : Math.min((usedCases / 3) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Abonnemang</h1>
        <p className="text-muted-foreground">
          Hantera ditt abonnemang och fakturering
        </p>
      </div>

      {/* Current Plan */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nuvarande plan</CardTitle>
              <CardDescription className="mt-1">
                Du är för närvarande på{" "}
                <span className="font-medium capitalize">{user.plan}</span>
                -planen
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-base px-4 py-1 capitalize">
              {user.plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage */}
          {!isPro && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Månadsanvändning</span>
                <span className="text-sm text-muted-foreground">
                  {usedCases} av {totalCases} fall använda
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Återställs den 1:a varje månad &bull; Period: {currentPeriod()}
              </p>
            </div>
          )}

          {isPro && (
            <div className="py-2">
              <p className="text-sm">
                <span className="text-lg font-semibold text-emerald-600">
                  {usedCases}
                </span>{" "}
                <span className="text-muted-foreground">
                  fall startade denna månad (obegränsade)
                </span>
              </p>
              {user.current_period_end && (
                <p className="text-xs text-muted-foreground mt-1">
                  Nästa faktureringsperiod:{" "}
                  {new Date(user.current_period_end).toLocaleDateString("sv-SE")}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <h3 className="font-medium mb-3">Din plan inkluderar:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-[#0f766e]" />
                <span>{isPro ? "Obegränsade" : "3"} patientfall per månad</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-[#0f766e]" />
                <span>
                  {isPro ? "Avancerad" : "Grundläggande"} AI-feedback
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-[#0f766e]" />
                <span>Tillgång till alla specialiteter</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-[#0f766e]" />
                <span>Sessionshistorik</span>
              </li>
            </ul>
          </div>

          {/* Manage subscription for Pro users */}
          {isPro && (
            <div className="pt-4">
              <BillingActions mode="manage" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Section — only for free users */}
      {!isPro && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Uppgradera till Pro</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan (Current) */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Free
                  <Badge variant="outline" className="ml-auto">
                    Nuvarande
                  </Badge>
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-semibold">0 kr</span>
                  <span className="text-muted-foreground ml-2">/månad</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">3 patientfall per månad</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">Grundläggande AI-feedback</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">Alla specialiteter</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">Sessionshistorik</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-[#0f766e] shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#0f766e] text-white px-4">
                  <Crown className="h-3 w-3 mr-1" />
                  Rekommenderad
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Pro
                  <Zap className="h-5 w-5 text-[#0f766e]" />
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-semibold">299 kr</span>
                  <span className="text-muted-foreground ml-2">/månad</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm font-medium">
                      Obegränsade patientfall
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">Avancerad AI-feedback</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">Detaljerad progressanalys</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">Prioriterad support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">Nya fall varje vecka</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#0f766e]" />
                    <span className="text-sm">Exportera resultat</span>
                  </li>
                </ul>
                <BillingActions mode="upgrade" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Benefits */}
      <Card className="border-border bg-gradient-to-br from-[#ecfdf5] to-white dark:from-emerald-950/20 dark:to-card">
        <CardHeader>
          <CardTitle>Varför uppgradera till Pro?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#0f766e] flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-medium mb-2">Obegränsad träning</h3>
              <p className="text-sm text-muted-foreground">
                Träna hur mycket du vill utan begränsningar. Perfekt för intensiv
                förberedelse.
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#0f766e] flex items-center justify-center mb-3">
                <Check className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-medium mb-2">Bättre feedback</h3>
              <p className="text-sm text-muted-foreground">
                Få mer detaljerad AI-analys av dina svar och lär dig snabbare.
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#0f766e] flex items-center justify-center mb-3">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-medium mb-2">Progressuppföljning</h3>
              <p className="text-sm text-muted-foreground">
                Se din utveckling över tid och identifiera områden att fokusera
                på.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Vanliga frågor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">
              Kan jag avbryta när som helst?
            </h4>
            <p className="text-sm text-muted-foreground">
              Ja, du kan avbryta ditt Pro-abonnemang när som helst. Du behåller
              tillgång till Pro-funktioner till slutet av din betalda period.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">
              Vilka betalningsmetoder accepteras?
            </h4>
            <p className="text-sm text-muted-foreground">
              Vi accepterar alla större kreditkort (Visa, Mastercard, American
              Express) samt Swish.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Får jag faktura?</h4>
            <p className="text-sm text-muted-foreground">
              Ja, du får automatiskt en faktura via e-post efter varje betalning.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
