import Link from "next/link";

/**
 * Beta-mode replacement for the full PricingSection. Shown on the landing
 * page while the product is free during beta (no payments). Keeps id="priser"
 * so existing Navbar/Footer "#priser" anchors still resolve. The original
 * PricingSection is left intact for when paid plans return post-beta.
 */

const INCLUDED = [
  "Obegränsad träning på alla patientfall",
  "Full AI-feedback per OSCE-rubrikområde",
  "Sessionshistorik och utvärderingar",
  "Inga betalningar, inget kort krävs",
];

export default function BetaPricingSection() {
  return (
    <section
      id="priser"
      aria-labelledby="pricing-heading"
      className="py-24 md:py-36 bg-white border-t border-zinc-200/50"
    >
      <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-16 text-center">
        <span className="reveal inline-block rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-zinc-100 text-[#64748B] border border-zinc-200/60 mb-5">
          Prissättning
        </span>
        <h2
          id="pricing-heading"
          className="reveal reveal-d1 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] leading-[1.1]"
        >
          Helt gratis under betan
        </h2>
        <p className="reveal reveal-d2 mt-5 text-base md:text-lg leading-relaxed text-[#64748B] max-w-[52ch] mx-auto">
          Medan vi bygger Diagnostika tillsammans med tidiga användare är allt
          gratis och fullt upplåst. Betalda planer kan komma längre fram — men
          inte under betan.
        </p>

        <div className="reveal reveal-d2 mt-12 mx-auto max-w-md">
          <div className="bg-white rounded-2xl border-2 border-[#457b9d]/25 p-8 shadow-[0_20px_40px_-15px_rgba(29,53,87,0.12)] text-left">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-[#1d3557] tracking-tighter">
                0 kr
              </span>
              <span className="text-[14px] text-[#1d3557]/40">
                under hela betan
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 bg-[#457b9d]/[0.06]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#457b9d"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-[14px] text-[#1d3557]/70">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block w-full px-5 py-3 bg-[#457b9d] text-white rounded-xl text-[14px] font-semibold text-center hover:bg-[#1d3557] active:scale-[0.98] transition-all duration-200"
            >
              Skapa gratis konto
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
