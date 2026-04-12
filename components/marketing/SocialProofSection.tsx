export default function SocialProofSection() {
  return (
    <section
      aria-labelledby="social-proof-heading"
      className="py-24 md:py-36 bg-[#1d3557] relative overflow-hidden"
    >
      <div className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(69,123,157,0.12)_0%,transparent_70%)]" aria-hidden="true" />
      <div className="absolute -left-16 -bottom-16 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,218,220,0.06)_0%,transparent_70%)]" aria-hidden="true" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 relative">
        <div className="max-w-2xl mb-16 md:mb-20">
          <span className="reveal inline-block rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/[0.06] text-[#a8dadc]/60 border border-white/[0.06] mb-5">
            Röster
          </span>
          <h2
            id="social-proof-heading"
            className="reveal reveal-d1 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] leading-[1.1] text-white"
          >
            Beprövad effekt för medicinstudenter
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* Featured testimonial — large */}
          <div className="md:col-span-7 reveal">
            <div className="bg-white/[0.08] border border-white/[0.08] rounded-[2rem] h-full">
              <div className="rounded-[calc(2rem-1px)] p-7 md:p-9 h-full flex flex-col justify-between">
                <blockquote className="text-lg md:text-xl leading-relaxed font-medium tracking-tight mb-8 text-white">
                  &ldquo;Diagnostika har förändrat hur mina studenter förbereder
                  sig inför kliniken. Den strukturerade återkopplingen bygger
                  självförtroende på ett sätt som läroböcker aldrig kan.&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#457b9d]/30 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                    KS
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      Dr. Karin Svensson
                    </p>
                    <p className="text-[12px] text-white/30">
                      Universitetslektor, Karolinska Institutet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two stacked testimonials */}
          <div className="md:col-span-5 flex flex-col gap-4 md:gap-5">
            <div className="reveal reveal-d1 flex-1">
              <div className="bg-white/[0.08] border border-white/[0.08] rounded-[2rem] h-full">
                <div className="rounded-[calc(2rem-1px)] p-6 md:p-7 h-full flex flex-col justify-between">
                  <blockquote className="text-[15px] leading-relaxed font-medium tracking-tight mb-6 text-white">
                    &ldquo;Jag brukade frysa under patientmöten. Efter 60+ fall
                    på Diagnostika går jag in i rummet och vet vad jag ska fråga
                    och varför.&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#457b9d]/30 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                      OH
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">
                        Omar Hassan
                      </p>
                      <p className="text-[12px] text-white/30">
                        Termin 6, Lunds Universitet
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal reveal-d2 flex-1">
              <div className="bg-white/[0.08] border border-white/[0.08] rounded-[2rem] h-full">
                <div className="rounded-[calc(2rem-1px)] p-6 md:p-7 h-full flex flex-col justify-between">
                  <blockquote className="text-[15px] leading-relaxed font-medium tracking-tight mb-6 text-white">
                    &ldquo;Vi integrerade Diagnostika i vår kliniska kurs förra
                    hösten. Diagnostisk noggrannhet förbättrades med 45% på en
                    termin.&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#457b9d]/30 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                      LB
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">
                        Dr. Lars Bergström
                      </p>
                      <p className="text-[12px] text-white/30">
                        Programansvarig, Sahlgrenska
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
