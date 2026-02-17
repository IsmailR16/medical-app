"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, FAQ } from "@/lib/plans";
import type { Plan } from "@/lib/plans";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  async function handleCheckout(planName: string) {
    if (!user) {
      router.push("/sign-up?plan=pro");
      return;
    }

    setLoading(true);
    try {
      const interval = annual ? "yearly" : "monthly";
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: `${planName.toLowerCase()}_${interval}`,
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
        }),
      });
      
      if (!res.ok) {
        console.error("Failed to create checkout session", await res.text());
        alert("Ett fel inträffade. Försök igen senare.");
        return;
      }

      const data = await res.json();
      if (data.url) { 
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <>
      {/* Hero / Header */}
      <section
        aria-labelledby="pricing-heading"
        className="bg-slate-50 px-6 py-20 text-center lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
            <Sparkles size={14} aria-hidden="true" />
            Enkel, transparent prissättning
          </div>

          <h1
            id="pricing-heading"
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Välj planen som passar{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              din resa
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-slate-600">
            Börja gratis och skala upp i takt med att du växer. Alla planer
            inkluderar tillgång till vår AI-patientsimuleringsmotor.
          </p>

          {/* Billing toggle */}
          <BillingToggle annual={annual} onChange={setAnnual} />
        </div>
      </section>

      {/* Cards */}
      <section
        aria-label="Prisplaner"
        className="relative -mt-8 px-6 pb-20 lg:px-8 lg:pb-28"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              annual={annual}
              loading={loading}
              onCheckout={handleCheckout}
            />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="border-t border-slate-100 bg-white px-6 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="faq-heading"
            className="mb-12 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
          >
            Vanliga frågor
          </h2>

          <dl className="space-y-8">
            {FAQ.map((item) => (
              <div key={item.question}>
                <dt className="text-lg font-semibold text-slate-900">
                  {item.question}
                </dt>
                <dd className="mt-2 leading-relaxed text-slate-600">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function BillingToggle({
  annual,
  onChange,
}: {
  annual: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <span
        className={`text-sm font-medium ${
          !annual ? "text-slate-900" : "text-slate-500"
        }`}
      >
        Månadsvis
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label="Växla årsbetalning"
        onClick={() => onChange(!annual)}
        className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 data-[state=checked]:bg-blue-600"
        data-state={annual ? "checked" : "unchecked"}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            annual ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>

      <span
        className={`text-sm font-medium ${
          annual ? "text-slate-900" : "text-slate-500"
        }`}
      >
        Årsvis{" "}
        <span className="ml-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
          Spara 35%
        </span>
      </span>
    </div>
  );
}

function PricingCard({
  plan,
  annual,
  loading,
  onCheckout,
}: {
  plan: Plan;
  annual: boolean;
  loading: boolean;
  onCheckout: (planName: string) => void;
}) {
  const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
  const isHighlighted = plan.highlighted;

  return (
    <article
      className={`relative flex flex-col rounded-3xl border p-8 transition-shadow lg:p-10 ${
        isHighlighted
          ? "border-blue-600 bg-white shadow-2xl shadow-blue-500/10 ring-1 ring-blue-600"
          : "border-slate-200 bg-white hover:shadow-xl"
      }`}
    >
      {/* Popular badge */}
      {isHighlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          Mest populär
        </div>
      )}

      {/* Plan name + description */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-extrabold tracking-tight text-slate-900">
            {price} kr
          </span>
          {price > 0 && (
            <span className="text-base font-medium text-slate-500">
              /mån
            </span>
          )}
        </div>
        {price > 0 && annual && (
          <p className="mt-1 text-sm text-slate-500">
            Faktureras årsvis ({price * 12} kr/år)
          </p>
        )}
        {price === 0 && (
          <p className="mt-1 text-sm text-slate-500">Gratis för alltid</p>
        )}
      </div>

      {/* CTA */}
      {plan.name === "Pro" ? (
        <Button
          onClick={() => onCheckout(plan.name)}
          disabled={loading}
          className={`mb-8 h-auto w-full rounded-2xl px-6 py-3.5 text-base font-bold group bg-blue-600 shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50`}
        >
          {loading ? "Laddar…" : plan.cta}
          <ChevronRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Button>
      ) : (
        <Button
          asChild
          className={`mb-8 h-auto w-full rounded-2xl px-6 py-3.5 text-base font-bold group ${
            isHighlighted
              ? "bg-blue-600 shadow-xl shadow-blue-500/20 hover:bg-blue-700"
              : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          <Link href={plan.href}>
            {plan.cta}
            <ChevronRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Button>
      )}

      {/* Features */}
      <ul role="list" className="flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
              aria-hidden="true"
            />
            <span className="text-sm text-slate-700">{feature}</span>
          </li>
        ))}
        {plan.excluded?.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-slate-400"
          >
            <X
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}