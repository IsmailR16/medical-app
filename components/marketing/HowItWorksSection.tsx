export default function HowItWorksSection() {
  return (
    <section
      id="hur-det-fungerar"
      aria-labelledby="how-it-works-heading"
      className="py-24 md:py-36 bg-white border-t border-zinc-200/50"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl mb-16 md:mb-24">
          <span className="reveal inline-block rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-zinc-100 text-[#64748B] border border-zinc-200/60 mb-5">
            Process
          </span>
          <h2
            id="how-it-works-heading"
            className="reveal reveal-d1 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] leading-[1.1]"
          >
            Effektiv träning i tre steg
          </h2>
        </div>

        {/* Step 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center mb-20 md:mb-32">
          <div className="md:col-span-5 reveal">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#A8DADC]/20 text-[#64748B] border border-[#A8DADC]/40 text-sm font-bold">
                01
              </span>
              <div className="h-[1px] flex-1 bg-zinc-200/60" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-4">
              Välj ett patientfall
            </h3>
            <p className="text-[15px] leading-relaxed text-[#64748B] max-w-[48ch]">
              Bläddra i vårt bibliotek och välj ett fall baserat på specialitet,
              svårighetsgrad eller dina lärandemål.
            </p>
          </div>
          <div className="md:col-span-7 reveal reveal-d1">
            <div className="p-[3px] rounded-[2rem] bg-zinc-200/40 ring-1 ring-zinc-950/[0.04]">
              <div className="bg-[#F9FAFB] rounded-[calc(2rem-3px)] p-5 md:p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-zinc-100 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200/50 flex items-center justify-center mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" aria-hidden="true">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold">Akutmedicin</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">42 fall</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-zinc-100 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/50 flex items-center justify-center mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold">Kardiologi</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">31 fall</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-zinc-100 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-200/50 flex items-center justify-center mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold">Pediatrik</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">28 fall</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-zinc-100 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <p className="text-[13px] font-semibold">Internmedicin</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">49 fall</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 (Reversed) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center mb-20 md:mb-32">
          <div className="md:col-span-7 md:order-1 reveal">
            <div className="p-[3px] rounded-[2rem] bg-zinc-200/40 ring-1 ring-zinc-950/[0.04]">
              <div className="bg-[#F9FAFB] rounded-[calc(2rem-3px)] p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8DADC] to-[#457B9D] flex items-center justify-center text-white text-xs font-bold">
                    BN
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold">
                      Björn Nilsson, 58M
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Andningssvårigheter, 2 veckor
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-zinc-100 mb-3">
                  <p className="text-[11px] text-[#94A3B8] mb-1.5">
                    Din fråga:
                  </p>
                  <p className="text-[12px] font-medium">
                    &ldquo;Har du haft några förkylningssymtom nyligen?&rdquo;
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#A8DADC]/30">
                  <p className="text-[11px] text-[#64748B] mb-1.5">
                    Patientens svar:
                  </p>
                  <p className="text-[12px]">
                    &ldquo;Nej, inte direkt. Men jag har hostat en del, särskilt
                    på morgonen. Jag har rökt i 30 år, men slutade för två år
                    sedan.&rdquo;
                  </p>
                </div>
                <div className="mt-3 bg-white rounded-xl p-3 border border-zinc-100">
                  <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#94A3B8] mb-2">
                    Snabborder
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-medium bg-[#F9FAFB] text-[#64748B] rounded-full px-2.5 py-1 border border-zinc-200/60">
                      Spirometri
                    </span>
                    <span className="text-[10px] font-medium bg-[#F9FAFB] text-[#64748B] rounded-full px-2.5 py-1 border border-zinc-200/60">
                      Lungröntgen
                    </span>
                    <span className="text-[10px] font-medium bg-[#F9FAFB] text-[#64748B] rounded-full px-2.5 py-1 border border-zinc-200/60">
                      CRP
                    </span>
                    <span className="text-[10px] font-medium bg-[#A8DADC]/20 text-[#1D3557] rounded-full px-2.5 py-1 border border-[#A8DADC]/40">
                      + Lägg till test
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-5 md:order-2 reveal reveal-d1">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#A8DADC]/20 text-[#64748B] border border-[#A8DADC]/40 text-sm font-bold">
                02
              </span>
              <div className="h-[1px] flex-1 bg-zinc-200/60" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-4">
              Genomför intervjun
            </h3>
            <p className="text-[15px] leading-relaxed text-[#64748B] max-w-[48ch]">
              Ta anamnes, beställ tester och fastställ en diagnos. AI-patienten
              svarar realistiskt på dina frågor och reagerar på varje kliniskt
              beslut.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-5 reveal">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#A8DADC]/20 text-[#64748B] border border-[#A8DADC]/40 text-sm font-bold">
                03
              </span>
              <div className="h-[1px] flex-1 bg-zinc-200/60" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-4">
              Få återkoppling
            </h3>
            <p className="text-[15px] leading-relaxed text-[#64748B] max-w-[48ch]">
              Få detaljerad feedback på din prestation och lär dig av varje fall.
              Diagnostika jämför ditt tillvägagångssätt med expertvägar och visar
              exakt var ditt tänkande avvek.
            </p>
          </div>
          <div className="md:col-span-7 reveal reveal-d1">
            <div className="p-[3px] rounded-[2rem] bg-zinc-200/40 ring-1 ring-zinc-950/[0.04]">
              <div className="bg-[#F9FAFB] rounded-[calc(2rem-3px)] p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A8DADC]" />
                    <span className="text-[11px] font-semibold text-[#1D3557]">
                      Fall avslutat
                    </span>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] ml-auto">
                    12m 47s totalt
                  </span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#A8DADC]/30 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-semibold">Din diagnos</p>
                    <span className="text-[10px] font-bold text-[#64748B] bg-[#A8DADC]/20 px-2 py-0.5 rounded-full border border-[#A8DADC]/40">
                      Korrekt
                    </span>
                  </div>
                  <p className="text-[12px] text-[#64748B]">
                    Akut sinuit med bakteriell överinfektion
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-zinc-100">
                  <p className="text-[11px] font-semibold mb-2">
                    Expertåterkoppling
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[#A8DADC]/30 text-[#64748B] flex items-center justify-center" aria-hidden="true">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                      <p className="text-[11px] text-[#64748B]">
                        Starkt: Systematisk anamnestagning med rätt fokusområden
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center" aria-hidden="true">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="0.5" />
                        </svg>
                      </span>
                      <p className="text-[11px] text-[#64748B]">
                        Missat: Allergianamnes var ofullständig &mdash; viktigt
                        för läkemedelsval
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[#A8DADC]/30 text-[#64748B] flex items-center justify-center" aria-hidden="true">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                      <p className="text-[11px] text-[#64748B]">
                        Starkt: Korrekt avgörande mellan viral och bakteriell
                        genes
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
