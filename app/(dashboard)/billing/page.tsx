import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Fakturering",
};

import { FREE_LIMIT } from "@/lib/plans";
import { getOrCreateUser } from "@/lib/auth/user";
import { getMonthlyUsage, currentPeriod } from "@/lib/db/dashboard";
import BillingActions from "./billing-actions";
import { PlanCards } from "./plan-cards";
import { TopBar } from "@/components/dashboard/TopBar";
import { FadeUp } from "@/components/dashboard/MotionWrappers";

export default async function BillingPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const usage = await getMonthlyUsage(user.user_id);
  const usedCases = usage?.sessions_started ?? 0;
  const isPro = user.plan === "pro" || user.plan === "institution";
  const totalCases = isPro ? Infinity : FREE_LIMIT;
  const progressValue = isPro ? 0 : Math.min((usedCases / FREE_LIMIT) * 100, 100);

  return (
    <>
      <TopBar title="Fakturering" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <FadeUp className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight">
            Fakturering
          </h1>
          <p className="text-[15px] text-[#94A3B8] mt-1">
            Hantera din prenumeration och betalningsmetoder
          </p>
        </FadeUp>

        {/* Current Plan */}
        <FadeUp delay={0.08} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] mb-8">
          <div className="px-6 py-5 border-b border-[#1d3557]/[0.04] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
                Nuvarande plan
              </h2>
              <p className="text-[13px] text-[#94A3B8] mt-0.5">
                Du är för närvarande på{" "}
                <span className="font-semibold capitalize text-[#1d3557]">{user.plan}</span>
                -planen
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#457b9d]/[0.06] text-[#457b9d] rounded-lg text-[12px] font-semibold">
              <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="capitalize">{user.plan}</span>
            </div>
          </div>

          <div className="p-6">
            {/* Usage for free users */}
            {!isPro && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-[#1d3557]">
                    Månadsanvändning
                  </span>
                  <span className="text-[13px] text-[#94A3B8]">
                    {usedCases} av {totalCases} fall använda
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#1d3557]/[0.04]">
                  <div
                    className="h-full rounded-full bg-[#457b9d] transition-all duration-500"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-2">
                  Återställs den 1:a varje månad &bull; Period: {currentPeriod()}
                </p>
              </div>
            )}

            {/* Stats for pro users */}
            {isPro && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    label: "Nästa faktureringsdatum",
                    value: user.current_period_end
                      ? new Date(user.current_period_end).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })
                      : "—",
                  },
                  {
                    label: "Fall denna månad",
                    value: `${usedCases} (obegränsade)`,
                  },
                  {
                    label: "Period",
                    value: currentPeriod(),
                  },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-[#F9FAFB] rounded-xl border border-[#1d3557]/[0.04]">
                    <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1">
                      {item.label}
                    </p>
                    <p className="text-[15px] font-bold text-[#1d3557] tracking-tight">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Plan features */}
            <div className="pt-5 border-t border-[#1d3557]/[0.04]">
              <h3 className="text-[13px] font-bold text-[#1d3557] mb-3">
                Din plan inkluderar:
              </h3>
              <ul className="space-y-2.5">
                {[
                  `${isPro ? "Obegränsade" : `${FREE_LIMIT}`} patientfall per månad`,
                  `${isPro ? "Avancerad" : "Grundläggande"} AI-feedback`,
                  "Tillgång till alla specialiteter",
                  "Sessionshistorik",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[13px] text-[#1d3557]">
                    <div className="w-5 h-5 rounded-lg bg-[#457b9d]/[0.06] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#457b9d]" strokeWidth={2} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Manage subscription for Pro users */}
            {isPro && (
              <div className="pt-5 mt-5 border-t border-[#1d3557]/[0.04]">
                <BillingActions mode="manage" />
              </div>
            )}
          </div>
        </FadeUp>

        {/* Available Plans */}
        <FadeUp delay={0.16}>
          <PlanCards isPro={isPro} />
        </FadeUp>

        {/* FAQ */}
        <FadeUp delay={0.24} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1d3557] tracking-tight mb-5">
            Vanliga frågor
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "Kan jag avbryta när som helst?",
                a: "Ja, du kan avbryta ditt Pro-abonnemang när som helst. Du behåller tillgång till Pro-funktioner till slutet av din betalda period.",
              },
              {
                q: "Vilka betalningsmetoder accepteras?",
                a: "Vi accepterar alla större kreditkort (Visa, Mastercard, American Express) samt Swish.",
              },
              {
                q: "Får jag faktura?",
                a: "Ja, du får automatiskt en faktura via e-post efter varje betalning.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h4 className="text-[14px] font-bold text-[#1d3557] mb-1">
                  {faq.q}
                </h4>
                <p className="text-[13px] text-[#94A3B8] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </>
  );
}
