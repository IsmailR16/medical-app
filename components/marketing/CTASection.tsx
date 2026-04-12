import Link from "next/link";

export default function CTASection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="py-24 md:py-36 border-t border-zinc-200/50 relative overflow-hidden"
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full pointer-events-none cta-gradient"
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 text-center relative">
        <h2
          id="cta-heading"
          className="reveal text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] leading-[1.1] max-w-3xl mx-auto"
        >
          Redo att förbättra ditt kliniska resonemang?
        </h2>
        <p className="reveal reveal-d1 mt-5 text-base md:text-lg leading-relaxed text-[#64748B] max-w-[50ch] mx-auto">
          Gå med hundratals medicinstudenter som redan tränar med Diagnostika.
        </p>
        <div className="reveal reveal-d2 mt-10">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-3 bg-[#1D3557] text-white text-[15px] font-semibold rounded-full pl-7 pr-2.5 py-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#457B9D] active:scale-[0.98]"
          >
            <span>Börja träna nu</span>
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
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
