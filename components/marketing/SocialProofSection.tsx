import Link from "next/link";

const POINTS = [
  {
    title: "Realistiska AI-patienter",
    body: "Öva anamnes, beställ undersökningar och ställ diagnos i en riskfri miljö som svarar som en riktig patient.",
  },
  {
    title: "Strukturerad OSCE-feedback",
    body: "Få bedömning per rubric-område — anamnes, undersökningar, kliniskt resonemang och åtgärd — på varje fall du gör.",
  },
  {
    title: "Din feedback formar produkten",
    body: "Som tidig användare påverkar du direkt vilka fall, funktioner och förbättringar vi bygger härnäst.",
  },
];

export default function SocialProofSection() {
  return (
    <section
      aria-labelledby="beta-heading"
      className="py-24 md:py-36 bg-[#1d3557] relative overflow-hidden"
    >
      <div
        className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(69,123,157,0.12)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -left-16 -bottom-16 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,218,220,0.06)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 relative">
        <div className="max-w-2xl mb-16 md:mb-20">
          <span className="reveal inline-block rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/[0.06] text-[#a8dadc]/60 border border-white/[0.06] mb-5">
            Tidig beta
          </span>
          <h2
            id="beta-heading"
            className="reveal reveal-d1 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] leading-[1.1] text-white"
          >
            Var med och forma verktyget från början
          </h2>
          <p className="reveal reveal-d2 mt-5 text-base md:text-lg leading-relaxed text-white/50">
            Diagnostika är i tidig beta och byggs aktivt tillsammans med
            läkarstudenter. Allt är gratis under betan — gå med, träna fritt och
            berätta vad som saknas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {POINTS.map((p, i) => (
            <div
              key={p.title}
              className={`reveal${i === 1 ? " reveal-d1" : i === 2 ? " reveal-d2" : ""}`}
            >
              <div className="bg-white/[0.08] border border-white/[0.08] rounded-[2rem] h-full">
                <div className="rounded-[calc(2rem-1px)] p-7 md:p-8 h-full">
                  <h3 className="text-lg font-semibold tracking-tight text-white mb-3">
                    {p.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/55">
                    {p.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal reveal-d2 mt-12">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-3 bg-white text-[#1d3557] text-[15px] font-semibold rounded-full pl-6 pr-2 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f1faee] active:scale-[0.98]"
          >
            <span>Gå med i betan — gratis</span>
            <span className="w-9 h-9 rounded-full bg-[#1d3557]/10 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
