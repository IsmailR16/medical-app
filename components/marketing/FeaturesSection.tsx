export default function FeaturesSection() {
  return (
    <section id="funktioner" aria-labelledby="features-heading" className="py-24 md:py-36">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl mb-16 md:mb-20">
          <span className="reveal inline-block rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-zinc-100 text-[#64748B] border border-zinc-200/60 mb-5">
            Plattform
          </span>
          <h2
            id="features-heading"
            className="reveal reveal-d1 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] leading-[1.1]"
          >
            Allt du behöver för att tänka som en läkare
          </h2>
          <p className="reveal reveal-d2 mt-5 text-base md:text-lg leading-relaxed text-[#64748B] max-w-[55ch]">
            En komplett plattform för att träna och perfektera dina kliniska
            färdigheter &mdash; från anamnes till diagnos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* Card 1: AI-patientsamtal (large) */}
          <div className="md:col-span-7 reveal">
            <div className="p-[3px] rounded-[2rem] bg-zinc-200/40 ring-1 ring-zinc-950/[0.04] h-full">
              <div className="bg-white rounded-[calc(2rem-3px)] p-6 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] h-full flex flex-col">
                <div className="bg-[#F9FAFB] rounded-2xl p-4 mb-6 flex-1 min-h-[200px]">
                  {/* Case header bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#1d3557] flex items-center justify-center">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5" aria-hidden="true">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1d3557]">
                          Akut bröstsmärta
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          Kardiologi &bull; Medel &bull; 45 min
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                      Pågående
                    </span>
                  </div>
                  {/* Mini chat preview */}
                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-md bg-[#457b9d]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#457b9d" strokeWidth="1.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                      </div>
                      <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 border border-[#1d3557]/[0.04] shadow-[0_1px_2px_rgba(29,53,87,0.03)]">
                        <p className="text-[11px] text-[#1d3557] leading-relaxed">
                          Jag har haft väldigt ont i bröstet sedan igår kväll.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="bg-gradient-to-br from-[#457b9d] to-[#3a6781] rounded-xl rounded-tr-sm px-3 py-2 shadow-[0_2px_8px_-2px_rgba(69,123,157,0.25)]">
                        <p className="text-[11px] text-white leading-relaxed">
                          Kan du beskriva smärtan? Strålar den ut någonstans?
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-md bg-[#457b9d]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#457b9d" strokeWidth="1.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                      </div>
                      <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 border border-[#1d3557]/[0.04] shadow-[0_1px_2px_rgba(29,53,87,0.03)]">
                        <p className="text-[11px] text-[#1d3557] leading-relaxed">
                          Det känns som en tryckkänsla, strålar mot vänster arm
                          och käke.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Vital signs strip */}
                  <div className="mt-3 flex gap-2 overflow-hidden">
                    <span className="text-[9px] font-medium text-[#457b9d] bg-[#457b9d]/[0.06] px-2 py-1 rounded-md whitespace-nowrap">
                      BP 145/95
                    </span>
                    <span className="text-[9px] font-medium text-[#457b9d] bg-[#457b9d]/[0.06] px-2 py-1 rounded-md whitespace-nowrap">
                      HR 98
                    </span>
                    <span className="text-[9px] font-medium text-[#e63946] bg-[#e63946]/[0.06] px-2 py-1 rounded-md whitespace-nowrap">
                      Troponin 850 ng/L
                    </span>
                    <span className="text-[9px] font-medium text-[#457b9d] bg-[#457b9d]/[0.06] px-2 py-1 rounded-md whitespace-nowrap">
                      SpO2 96%
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    AI-patientsamtal
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748B]">
                    Intervjua realistiska AI-patienter med klinisk data,
                    vitalparametrar och labbsvar &mdash; precis som på
                    akutmottagningen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Kliniskt resonemang */}
          <div className="md:col-span-5 reveal reveal-d1">
            <div className="p-[3px] rounded-[2rem] bg-zinc-200/40 ring-1 ring-zinc-950/[0.04] h-full">
              <div className="bg-white rounded-[calc(2rem-3px)] p-6 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] h-full flex flex-col">
                <div className="bg-[#F9FAFB] rounded-2xl p-4 mb-6 flex-1 min-h-[200px]">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#94A3B8] mb-3">
                    Differentialdiagnostik
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-[#1d3557]">
                          Akut hjärtinfarkt
                        </span>
                        <span className="text-[11px] font-bold text-[#457b9d]">
                          88%
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full w-[88%] bg-[#457b9d] rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-[#1d3557]">
                          Instabil angina
                        </span>
                        <span className="text-[11px] font-bold text-[#64748B]">
                          42%
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full w-[42%] bg-zinc-400 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-[#1d3557]">
                          Lungödem
                        </span>
                        <span className="text-[11px] font-bold text-[#64748B]">
                          18%
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full w-[18%] bg-zinc-300 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium text-[#94A3B8]">
                          Aortadissektion
                        </span>
                        <span className="text-[11px] font-medium text-[#94A3B8]">
                          8%
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full w-[8%] bg-zinc-200 rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* Evidence tag */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-[9px] font-medium text-[#e63946] bg-[#e63946]/[0.06] px-2 py-0.5 rounded-md">
                      ST-höjning V2-V4
                    </span>
                    <span className="text-[9px] font-medium text-[#e63946] bg-[#e63946]/[0.06] px-2 py-0.5 rounded-md">
                      Troponin &#8593;
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Kliniskt resonemang
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748B]">
                    Bygg differentialdiagnoser utifrån symtom, labbresultat och
                    EKG &mdash; samma process som i kliniken.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Utvärderingar */}
          <div className="md:col-span-5 reveal reveal-d1">
            <div className="p-[3px] rounded-[2rem] bg-zinc-200/40 ring-1 ring-zinc-950/[0.04] h-full">
              <div className="bg-white rounded-[calc(2rem-3px)] p-6 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] h-full flex flex-col">
                <div className="bg-[#F9FAFB] rounded-2xl p-4 mb-6 flex-1 min-h-[200px]">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#94A3B8] mb-3">
                    Prestation per kategori
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-[#1d3557]">
                          Anamnestagning
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-[#457b9d]">
                            +12%
                          </span>
                          <span className="text-[11px] font-bold text-[#1d3557]">
                            78
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full w-[78%] bg-[#457b9d] rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-[#1d3557]">
                          Fysisk undersökning
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-[#457b9d]">
                            +5%
                          </span>
                          <span className="text-[11px] font-bold text-[#1d3557]">
                            65
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full w-[65%] bg-[#457b9d] rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-[#1d3557]">
                          Differentialdiagnostik
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-[#e63946]">
                            -3%
                          </span>
                          <span className="text-[11px] font-bold text-[#1d3557]">
                            42
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full w-[42%] bg-[#e63946] rounded-full" />
                      </div>
                    </div>
                    <div className="opacity-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium text-[#94A3B8]">
                          Behandlingsplanering
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-[#94A3B8]">
                            +8%
                          </span>
                          <span className="text-[11px] font-medium text-[#94A3B8]">
                            58
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full w-[58%] bg-zinc-200 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Utvärderingar
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748B]">
                    Följ din prestation över tid med detaljerad återkoppling per
                    kategori och trendanalys.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Fallbibliotek (large) */}
          <div className="md:col-span-7 reveal reveal-d2">
            <div className="p-[3px] rounded-[2rem] bg-zinc-200/40 ring-1 ring-zinc-950/[0.04] h-full">
              <div className="bg-white rounded-[calc(2rem-3px)] p-6 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] h-full flex flex-col">
                <div className="bg-[#F9FAFB] rounded-2xl p-4 mb-6 flex-1 min-h-[200px]">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#94A3B8] mb-3">
                    Fallbibliotek &mdash; 150+ kliniska scenarier
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-zinc-100">
                      <div>
                        <p className="text-[12px] font-semibold text-[#1d3557]">
                          Akut hjärtinfarkt
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">
                          Kardiologi &bull; 45 min
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                        Medel
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-zinc-100">
                      <div>
                        <p className="text-[12px] font-semibold text-[#1d3557]">
                          Typ 2 Diabetes-hantering
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">
                          Endokrinologi &bull; 30 min
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-[#457b9d] bg-[#457b9d]/[0.06] px-2 py-0.5 rounded-full border border-[#457b9d]/10">
                        Nybörjare
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-zinc-100">
                      <div>
                        <p className="text-[12px] font-semibold text-[#1d3557]">
                          Samhällsförvärvad pneumoni
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">
                          Lungmedicin &bull; 40 min
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                        Medel
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    150+ patientfall
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748B]">
                    Alla 6 specialiteter från plattformen &mdash; Kardiologi,
                    Endokrinologi, Lungmedicin, Kirurgi, Neurologi och
                    Akutmedicin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


