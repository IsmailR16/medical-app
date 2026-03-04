"use client";

import { useState } from "react";
import { Check, Crown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BillingActions from "./billing-actions";

interface UpgradeSectionProps {
  monthlyPrice: number;
  yearlyPrice: number;
}

export function UpgradeSection({ monthlyPrice, yearlyPrice }: UpgradeSectionProps) {
  const [yearly, setYearly] = useState(true);

  const price = yearly ? yearlyPrice : monthlyPrice;
  const interval: "monthly" | "yearly" = yearly ? "yearly" : "monthly";
  const savingsPercent = Math.round(
    ((monthlyPrice - yearlyPrice) / monthlyPrice) * 100
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Uppgradera till Pro</h2>
        {/* Billing toggle */}
        <div
          role="radiogroup"
          aria-label="Faktureringsperiod"
          className="flex items-center gap-0.5 rounded-full bg-muted p-1"
        >
          <button
            role="radio"
            aria-checked={!yearly}
            onClick={() => setYearly(false)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              !yearly
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Månadsvis
          </button>
          <button
            role="radio"
            aria-checked={yearly}
            onClick={() => setYearly(true)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              yearly
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Årsvis
            <span className="ml-1 text-[10px] font-semibold text-emerald-600">
              -{savingsPercent}%
            </span>
          </button>
        </div>
      </div>

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
              <span className="text-4xl font-semibold">{price} kr</span>
              <span className="text-muted-foreground ml-2">/månad</span>
              {yearly && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({price * 12} kr/år)
                </span>
              )}
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
            <BillingActions mode="upgrade" interval={interval} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
