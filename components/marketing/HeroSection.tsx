import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-slate-50 px-6 py-20 text-center lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-700">
          <Zap size={14} fill="currentColor" aria-hidden="true" />
          Framtiden för medicinsk träning
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-7xl"
        >
          Bemästra kliniskt resonemang med{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            realistiska AI-patienter
          </span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto max-w-2xl text-lg text-slate-600 sm:text-xl">
          Träna diagnostik, patientintervjuer och behandlingsplanering i en
          riskfri miljö. Få realtidsfeedback från vår intelligenta
          medicinska bedömningsmotor.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button
            asChild
            className="h-auto w-full rounded-2xl bg-teal-700 px-8 py-4 text-lg font-bold shadow-xl shadow-teal-500/20 hover:bg-teal-800 sm:w-auto group"
          >
            <Link href="/sign-up">
              Kom igång gratis
              <ChevronRight
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto w-full rounded-2xl border-slate-200 px-8 py-4 text-lg font-bold sm:w-auto"
          >
            <Link href="/features">Visa demo</Link>
          </Button>
        </div>
      </div>

      {/* App Preview */}
      <AppPreview />
    </section>
  );
}

function AppPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl lg:mt-20" aria-hidden="true">
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-3 shadow-2xl sm:p-4">
        {/* Window chrome */}
        <div className="mb-3 flex items-center gap-2 px-2 sm:mb-4">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>

        {/* Mock content */}
        <div className="flex h-64 overflow-hidden rounded-xl bg-white sm:h-80 lg:h-[400px]">
          {/* Sidebar */}
          <div className="hidden w-1/4 space-y-4 border-r border-slate-100 p-4 sm:block">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>

          {/* Chat area */}
          <div className="flex-1 p-4 sm:p-8">
            <div className="mb-6 h-6 w-1/3 rounded-lg bg-slate-50 sm:mb-10 sm:h-8" />
            <div className="space-y-3 sm:space-y-4">
              <div className="h-14 w-3/4 rounded-2xl bg-teal-50 sm:h-20" />
              <div className="ml-auto h-12 w-2/3 rounded-2xl bg-slate-50 sm:h-16" />
              <div className="h-14 w-3/4 rounded-2xl bg-teal-50 sm:h-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Background glow */}
      <div className="pointer-events-none absolute -z-10 left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/20 blur-[120px]" />
    </div>
  );
}
