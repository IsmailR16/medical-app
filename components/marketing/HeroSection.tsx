import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="min-h-[100dvh] bg-white flex items-center relative overflow-hidden"
    >
      <div
        className="absolute top-1/3 right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none hero-gradient-tr"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none hero-gradient-bl"
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 w-full pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div>
              <span className="inline-block rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#A8DADC]/20 text-[#1D3557] border border-[#A8DADC]/40 mb-6">
                AI-driven medicinsk träning
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-[-0.035em] leading-[1.08]"
            >
              Klinisk träning
              med AI-patienter
            </h1>

            <p className="mt-6 text-base md:text-lg leading-relaxed text-[#64748B] max-w-[52ch]">
              Träna på realistiska patientfall, utveckla diagnostiska
              färdigheter och få strukturerad återkoppling på varje kliniskt
              beslut du tar.
            </p>

            <div className="mt-8">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-3 bg-[#457B9D] text-white text-[15px] font-semibold rounded-full pl-6 pr-2 py-2.5 transition-all duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#1D3557] active:scale-[0.98] shadow-[0_8px_24px_-4px_rgba(69,123,157,0.35)]"
              >
                <span>Börja träna gratis</span>
                <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
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

            {/* Stats */}
            <div className="mt-10 pt-6 flex items-center gap-6 border-t border-[#1d3557]/[0.06]">
              <div>
                <p className="text-2xl font-extrabold tracking-tight">500+</p>
                <p className="text-[12px] text-[#94A3B8]">Aktiva studenter</p>
              </div>
              <div className="w-px h-10 bg-zinc-200" />
              <div>
                <p className="text-2xl font-extrabold tracking-tight">150+</p>
                <p className="text-[12px] text-[#94A3B8]">Kliniska fall</p>
              </div>
              <div className="w-px h-10 bg-zinc-200" />
              <div>
                <p className="text-2xl font-extrabold tracking-tight">10k+</p>
                <p className="text-[12px] text-[#94A3B8]">
                  Genomförda sessioner
                </p>
              </div>
            </div>
          </div>

          {/* Chat Mockup */}
          <div className="lg:col-span-7 xl:col-span-7">
            <ChatMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatMockup() {
  return (
    <div
      className="relative max-w-[620px] ml-auto"
    >
      <div
        className="absolute -inset-16 bg-[radial-gradient(circle,rgba(69,123,157,0.07)_0%,rgba(168,218,220,0.09)_40%,transparent_70%)] rounded-[2rem]"
        aria-hidden="true"
      />
      <div className="relative bg-white border border-[#1d3557]/[0.06] rounded-3xl p-1.5 shadow-[0_20px_60px_-15px_rgba(29,53,87,0.12)]">
        <div className="bg-white rounded-[1.25rem] border border-[#1d3557]/[0.04] overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#1d3557] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/[0.06]">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#a8dadc"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-white">Patient</p>
                <p className="text-[11px] text-white/40">
                  62 år &middot; Akut hjärtinfarkt
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#e63946] rounded-full animate-pulse" />
              <span className="text-[11px] text-white/40">Aktiv</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            className="p-5 space-y-4 bg-[#f8fafb] min-h-[380px]"
          >
            {/* Patient */}
            <div className="flex gap-3">
              <SparkleIcon />
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] border border-[#1d3557]/[0.04] shadow-[0_1px_2px_rgba(29,53,87,0.03)]">
                <p className="text-[13px] text-[#1d3557] leading-relaxed">
                  Jag har ont i bröstet och känner mig yr.
                </p>
              </div>
            </div>

            {/* Doctor */}
            <div className="flex gap-3 justify-end">
              <div className="bg-gradient-to-br from-[#457b9d] to-[#3a6781] rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-[0_2px_8px_-2px_rgba(69,123,157,0.25)]">
                <p className="text-[13px] text-white leading-relaxed">
                  Berätta mer om smärtan. Var sitter den och hur länge har
                  du haft besvär?
                </p>
              </div>
            </div>

            {/* Patient response */}
            <div className="flex gap-3">
              <SparkleIcon />
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] border border-[#1d3557]/[0.04] shadow-[0_1px_2px_rgba(29,53,87,0.03)]">
                <p className="text-[13px] text-[#1d3557] leading-relaxed">
                  Det började för ungefär 30 minuter sedan. Smärtan är
                  tryckande mitt i bröstet och strålar ut i vänster arm.
                </p>
              </div>
            </div>

            {/* Doctor */}
            <div className="flex gap-3 justify-end">
              <div className="bg-gradient-to-br from-[#457b9d] to-[#3a6781] rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-[0_2px_8px_-2px_rgba(69,123,157,0.25)]">
                <p className="text-[13px] text-white leading-relaxed">
                  Har du någon tidigare hjärtsjukdom?
                </p>
              </div>
            </div>

            {/* Typing */}
            <div className="flex gap-3" role="status" aria-live="polite">
              <SparkleIcon />
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 border border-[#1d3557]/[0.04] shadow-[0_1px_2px_rgba(29,53,87,0.03)]">
                <div className="flex gap-1.5">
                  <span
                    className="w-1.5 h-1.5 bg-[#457b9d]/30 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-[#457b9d]/30 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-[#457b9d]/30 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="sr-only">Patienten skriver...</span>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-[#1d3557]/[0.04] p-4 bg-white select-none cursor-default" aria-hidden="true">
            <div className="flex gap-2 items-center">
              <div
                className="flex-1 px-4 py-2.5 bg-[#f8fafb] border border-[#1d3557]/[0.06] rounded-xl text-[13px] text-[#1d3557]/25 cursor-default"
              >
                Ställ nästa fråga...
              </div>
              <div
                className="px-4 py-2.5 bg-[#457b9d] text-white rounded-xl text-[13px] font-medium shrink-0 cursor-default"
              >
                Skicka
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -right-3 bg-[#e63946] text-white px-3.5 py-2 rounded-xl shadow-[0_4px_16px_-2px_rgba(230,57,70,0.35)]">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
            />
          </svg>
          <span className="text-[13px] font-medium">AI-drivet</span>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <div className="w-7 h-7 bg-[#457b9d]/10 rounded-lg flex items-center justify-center shrink-0">
      <svg
        width="14"
        height="14"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#457b9d"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
        />
      </svg>
    </div>
  );
}
