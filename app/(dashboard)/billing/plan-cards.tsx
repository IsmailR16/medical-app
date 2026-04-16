"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";
import BillingActions from "./billing-actions";

interface PlanCardsProps {
  isPro: boolean;
}

export function PlanCards({ isPro }: PlanCardsProps) {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      key: "free" as const,
      name: "Gratis",
      monthlyPrice: 0,
      yearlyPrice: 0,
      period: "för alltid",
      features: PLANS[0].features,
      isCurrent: !isPro,
      featured: false,
    },
    {
      key: "pro" as const,
      name: "Pro",
      monthlyPrice: PLANS[1].monthlyPrice,
      yearlyPrice: PLANS[1].yearlyPrice,
      period: "månad",
      features: PLANS[1].features,
      isCurrent: isPro,
      featured: true,
    },
    {
      key: "institution" as const,
      name: "Institution",
      monthlyPrice: PLANS[2].monthlyPrice,
      yearlyPrice: PLANS[2].yearlyPrice,
      period: "",
      features: PLANS[2].features.slice(0, 6),
      isCurrent: false,
      featured: false,
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
          Tillgängliga planer
        </h2>
        <BillingToggle annual={annual} onChange={setAnnual} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const price =
            plan.key === "institution"
              ? "Anpassat"
              : String(annual ? plan.yearlyPrice : plan.monthlyPrice);

          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                plan.featured
                  ? "bg-[#1d3557] md:scale-105 shadow-[0_12px_40px_-8px_rgba(29,53,87,0.3)]"
                  : "bg-white border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] hover:shadow-[0_8px_24px_-8px_rgba(29,53,87,0.1)]"
              }`}
            >
              {/* "Populärast" badge on Pro */}
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#e63946] text-white text-[10px] font-bold uppercase tracking-[0.1em] rounded-full shadow-[0_4px_12px_-2px_rgba(230,57,70,0.4)]">
                  Populärast
                </div>
              )}

              {/* "Nuvarande plan" badge */}
              {plan.isCurrent && !plan.featured && (
                <span className="inline-flex items-center px-2.5 py-1 bg-[#457b9d]/[0.06] text-[#457b9d] rounded-lg text-[10px] font-semibold mb-4">
                  Nuvarande plan
                </span>
              )}

              <h3
                className={`text-xl font-bold tracking-tight mb-2 ${
                  plan.featured ? "text-white mt-2" : "text-[#1d3557]"
                }`}
              >
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-6">
                {price === "Anpassat" ? (
                  <span
                    className={`text-2xl font-extrabold tracking-tight ${
                      plan.featured ? "text-white" : "text-[#1d3557]"
                    }`}
                  >
                    Anpassat pris
                  </span>
                ) : (
                  <>
                    <span
                      className={`text-4xl font-extrabold tracking-tight font-mono ${
                        plan.featured ? "text-white" : "text-[#1d3557]"
                      }`}
                    >
                      {price}
                    </span>
                    {plan.period && (
                      <span
                        className={`text-[13px] font-medium ${
                          plan.featured ? "text-white/40" : "text-[#94A3B8]"
                        }`}
                      >
                        kr / {plan.period}
                      </span>
                    )}
                    {annual && plan.yearlyPrice > 0 && (
                      <span
                        className={`text-[11px] font-medium ml-1 ${
                          plan.featured ? "text-white/30" : "text-[#94A3B8]/70"
                        }`}
                      >
                        ({plan.yearlyPrice * 12} kr/år)
                      </span>
                    )}
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.featured ? "bg-white/[0.08]" : "bg-[#457b9d]/[0.06]"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.featured ? "text-[#a8dadc]" : "text-[#457b9d]"
                        }`}
                        strokeWidth={2}
                      />
                    </div>
                    <span
                      className={`text-[13px] leading-relaxed ${
                        plan.featured ? "text-white/60" : "text-[#64748B]"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              {plan.key === "pro" && !isPro && (
                <BillingActions
                  mode="upgrade"
                  interval={annual ? "yearly" : "monthly"}
                />
              )}
              {plan.key === "pro" && isPro && (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-white/20 text-white/60 cursor-not-allowed"
                >
                  Nuvarande plan
                </button>
              )}
              {plan.key === "free" && !isPro && (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#94A3B8] cursor-not-allowed"
                >
                  Nuvarande plan
                </button>
              )}
              {plan.key === "free" && isPro && (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#94A3B8] cursor-not-allowed"
                >
                  Gratis
                </button>
              )}
              {plan.key === "institution" && (
                <button className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#1d3557] hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]">
                  Kontakta försäljning
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BillingToggle({
  annual,
  onChange,
}: {
  annual: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1d3557]/[0.04]">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`relative cursor-pointer px-4 py-1.5 rounded-lg text-[12px] font-semibold tracking-tight transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          !annual
            ? "bg-white text-[#1d3557] shadow-[0_1px_4px_-1px_rgba(29,53,87,0.12)]"
            : "text-[#94A3B8] hover:text-[#64748B]"
        }`}
      >
        Månadsvis
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`relative flex items-center gap-1.5 cursor-pointer px-4 py-1.5 rounded-lg text-[12px] font-semibold tracking-tight transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          annual
            ? "bg-white text-[#1d3557] shadow-[0_1px_4px_-1px_rgba(29,53,87,0.12)]"
            : "text-[#94A3B8] hover:text-[#64748B]"
        }`}
      >
        Årsvis
        <span className="rounded-full bg-[#e63946]/[0.08] px-1.5 py-0.5 text-[9px] font-bold text-[#e63946] leading-none">
          −25%
        </span>
      </button>
    </div>
  );
}
