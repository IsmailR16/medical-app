"use client";

import { useState } from "react";
import Link from "next/link";

function CheckIcon({ light }: { light?: boolean }) {
  return (
    <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 ${light ? "bg-white/10" : "bg-[#457b9d]/[0.06]"}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={light ? "#a8dadc" : "#457b9d"} strokeWidth="2" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);
  return (
    <section
      id="priser"
      aria-labelledby="pricing-heading"
      className="py-24 md:py-36 bg-white border-t border-zinc-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <span className="reveal inline-block rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-zinc-100 text-[#64748B] border border-zinc-200/60 mb-5">
            Prissättning
          </span>
          <h2
            id="pricing-heading"
            className="reveal reveal-d1 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] leading-[1.1]"
          >
            Enkla, transparenta priser
          </h2>
          <p className="reveal reveal-d2 mt-5 text-base md:text-lg leading-relaxed text-[#64748B]">
            Välj planen som passar dig bäst
          </p>

          {/* Billing toggle */}
          <div className="reveal reveal-d2 flex items-center justify-center gap-3 mt-8">
            <span className={`text-[13px] font-medium transition-colors duration-300 ${!annual ? "text-[#1d3557]" : "text-[#64748B]"}`}>
              Månadsvis
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Växla årsbetalning"
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-[#1d3557]/10 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#457b9d] focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none block h-4 w-4 rounded-full bg-[#1d3557] shadow-sm ring-0 transition-transform duration-300 ${annual ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </button>
            <span className={`text-[13px] font-medium transition-colors duration-300 ${annual ? "text-[#1d3557]" : "text-[#64748B]"}`}>
              Årsvis{" "}
              <span className="ml-1 inline-block rounded-full bg-[#e63946]/10 px-2 py-0.5 text-[11px] font-semibold text-[#e63946]">
                Spara 25%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Gratis */}
          <div className="reveal bg-white rounded-2xl border-2 border-[#1d3557]/[0.06] p-7 hover:border-[#457b9d]/25 hover:shadow-[0_8px_24px_-4px_rgba(29,53,87,0.08)] transition-all duration-300">
            <h3 className="text-xl font-semibold text-[#1d3557] tracking-tight mb-1">
              Gratis
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#1d3557] tracking-tighter">
                0 kr
              </span>
              <span className="text-[14px] text-[#1d3557]/30">/månad</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-[14px] text-[#1d3557]/45">
                  5 fall per månad
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-[14px] text-[#1d3557]/45">
                  Grundläggande feedback
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-[14px] text-[#1d3557]/45">
                  Tillgång till 20 fall
                </span>
              </li>
            </ul>
            <Link
              href="/sign-up"
              className="block w-full px-5 py-2.5 border border-[#1d3557]/[0.12] text-[#1d3557] rounded-xl text-[14px] font-medium text-center hover:bg-[#1d3557]/[0.03] active:scale-[0.98] transition-all duration-200"
            >
              Kom igång
            </Link>
          </div>

          {/* Student (featured) */}
          <div className="reveal reveal-d1 relative bg-[#1d3557] rounded-2xl p-7 shadow-[0_20px_40px_-15px_rgba(29,53,87,0.3)] md:scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e63946] text-white px-3 py-1 rounded-lg text-[12px] font-semibold tracking-wide shadow-[0_4px_12px_-2px_rgba(230,57,70,0.35)]">
              Populärast
            </div>
            <div className="pt-2">
              <h3 className="text-xl font-semibold text-white tracking-tight mb-1">
                Student
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white tracking-tighter">
                  {annual ? "71 kr" : "95 kr"}
                </span>
                <span className="text-[14px] text-white/30">/månad</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2.5">
                  <CheckIcon light />
                  <span className="text-[14px] text-white/60">
                    Obegränsade fall
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon light />
                  <span className="text-[14px] text-white/60">
                    Detaljerad AI-feedback
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon light />
                  <span className="text-[14px] text-white/60">
                    Alla 150+ fall
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckIcon light />
                  <span className="text-[14px] text-white/60">
                    Prestandaanalys
                  </span>
                </li>
              </ul>
              <Link
                href="/sign-up?plan=pro"
                className="block w-full px-5 py-2.5 bg-white text-[#1d3557] rounded-xl text-[14px] font-medium text-center hover:bg-[#f1faee] active:scale-[0.98] transition-all duration-200"
              >
                Börja nu
              </Link>
            </div>
          </div>

          {/* Institution */}
          <div className="reveal reveal-d2 bg-white rounded-2xl border-2 border-[#1d3557]/[0.06] p-7 hover:border-[#457b9d]/25 hover:shadow-[0_8px_24px_-4px_rgba(29,53,87,0.08)] transition-all duration-300">
            <h3 className="text-xl font-semibold text-[#1d3557] tracking-tight mb-1">
              Institution
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#1d3557] tracking-tighter">
                {annual ? "799 kr" : "999 kr"}
              </span>
              <span className="text-[14px] text-[#1d3557]/30">/månad</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-[14px] text-[#1d3557]/45">
                  Allt i Student
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-[14px] text-[#1d3557]/45">
                  Anpassade fall
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-[14px] text-[#1d3557]/45">
                  Admin-dashboard
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-[14px] text-[#1d3557]/45">
                  Dedikerad support
                </span>
              </li>
            </ul>
            <a
              href="mailto:kontakt@diagnostika.se"
              className="block w-full px-5 py-2.5 border border-[#1d3557]/[0.12] text-[#1d3557] rounded-xl text-[14px] font-medium text-center hover:bg-[#1d3557]/[0.03] active:scale-[0.98] transition-all duration-200"
            >
              Kontakta oss
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
