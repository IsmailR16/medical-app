const UNIVERSITIES = [
  "Karolinska Institutet",
  "Lunds Universitet",
  "Sahlgrenska Akademin",
  "Uppsala Universitet",
  "Linköpings Universitet",
  "Umeå Universitet",
  "Örebro Universitet",
] as const;

export default function TrustedBySection() {
  return (
    <section
      aria-label="Används av medicinstudenter på 30+ lärosäten"
      className="py-16 md:py-20 border-t border-zinc-200/50"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
        <p className="reveal text-center text-[13px] font-medium text-[#94A3B8] uppercase tracking-[0.15em] mb-10">
          Används av medicinstudenter på 30+ lärosäten
        </p>

        <div
          className="reveal reveal-d1 relative overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex w-max marquee-track">
            <div className="flex items-center shrink-0">
              {UNIVERSITIES.map((uni) => (
                <span
                  key={uni}
                  className="text-[15px] md:text-[17px] font-bold tracking-tight text-zinc-300 whitespace-nowrap px-6 md:px-10"
                >
                  {uni}
                </span>
              ))}
            </div>
            <div className="flex items-center shrink-0" aria-hidden="true">
              {UNIVERSITIES.map((uni) => (
                <span
                  key={`dup-${uni}`}
                  className="text-[15px] md:text-[17px] font-bold tracking-tight text-zinc-300 whitespace-nowrap px-6 md:px-10"
                >
                  {uni}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
