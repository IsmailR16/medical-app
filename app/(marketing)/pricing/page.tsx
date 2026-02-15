"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted?: boolean;
  cta: string;
  href: string;
  features: string[];
  excluded?: string[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    description:
      "Perfect for trying out AI patient simulations and exploring the platform.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Get Started",
    href: "/sign-up",
    features: [
      "3 AI patient cases per month",
      "Basic diagnostic feedback",
      "Community access",
      "Standard response speed",
    ],
    excluded: [
      "Advanced analytics dashboard",
      "Custom case creation",
      "Priority support",
      "Team collaboration",
    ],
  },
  {
    name: "Pro",
    description:
      "For medical students serious about mastering clinical reasoning skills.",
    monthlyPrice: 29,
    yearlyPrice: 19,
    highlighted: true,
    cta: "Start Free Trial",
    href: "/sign-up?plan=pro",
    features: [
      "Unlimited AI patient cases",
      "Advanced diagnostic analytics",
      "Custom case creation",
      "Priority response speed",
      "Detailed performance rubrics",
      "Export session reports",
      "Priority email support",
    ],
    excluded: [
      "Team collaboration",
    ],
  },
  {
    name: "Institution",
    description:
      "Built for universities and teaching hospitals managing student cohorts.",
    monthlyPrice: 99,
    yearlyPrice: 79,
    cta: "Contact Sales",
    href: "/sign-up?plan=institution",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Admin dashboard & analytics",
      "Custom curriculum integration",
      "SSO & SAML authentication",
      "Dedicated account manager",
      "SLA & uptime guarantee",
      "On-premise deployment option",
    ],
  },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel your plan at any time from your account settings. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial for the Pro plan?",
    answer:
      "Absolutely — every Pro subscription starts with a 14-day free trial. No credit card required to begin.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, Amex) as well as PayPal. Institutional plans can also pay via invoice.",
  },
  {
    question: "Do you offer student discounts?",
    answer:
      "Yes! Verified students receive an additional 20% off the Pro plan. Verify your student status in your account settings after signing up.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your session data and reports are retained for 90 days after cancellation, giving you time to export anything you need.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  
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
            Simple, transparent pricing
          </div>

          <h1
            id="pricing-heading"
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Choose the plan that fits{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              your journey
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-slate-600">
            Start free and scale as you grow. All plans include access to our
            core AI patient simulation engine.
          </p>

          {/* Billing toggle */}
          <BillingToggle annual={annual} onChange={setAnnual} />
        </div>
      </section>

      {/* Cards */}
      <section
        aria-label="Pricing plans"
        className="relative -mt-8 px-6 pb-20 lg:px-8 lg:pb-28"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              annual={annual}
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
            Frequently Asked Questions
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
        Monthly
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label="Toggle annual billing"
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
        Annual{" "}
        <span className="ml-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
          Save 35%
        </span>
      </span>
    </div>
  );
}

function PricingCard({
  plan,
  annual,
}: {
  plan: Plan;
  annual: boolean;
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
          Most Popular
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
            ${price}
          </span>
          {price > 0 && (
            <span className="text-base font-medium text-slate-500">
              /mo
            </span>
          )}
        </div>
        {price > 0 && annual && (
          <p className="mt-1 text-sm text-slate-500">
            Billed annually (${price * 12}/year)
          </p>
        )}
        {price === 0 && (
          <p className="mt-1 text-sm text-slate-500">Free forever</p>
        )}
      </div>

      {/* CTA */}
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