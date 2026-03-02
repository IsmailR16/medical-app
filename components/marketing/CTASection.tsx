import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function CTASection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="bg-slate-900 px-6 py-20 text-center lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <h2
          id="cta-heading"
          className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          Ready to Sharpen Your Clinical Skills?
        </h2>
        <p className="mx-auto max-w-xl text-lg text-slate-400">
          Join thousands of medical students who are building diagnostic
          confidence through realistic AI patient simulations.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button
            asChild
            className="h-auto w-full rounded-2xl bg-teal-700 px-8 py-4 text-lg font-bold shadow-xl shadow-teal-500/30 hover:bg-teal-800 sm:w-auto group"
          >
            <Link href="/sign-up">
              Start Practicing for Free
              <ChevronRight
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto w-full rounded-2xl border-slate-700 bg-transparent px-8 py-4 text-lg font-bold text-white hover:bg-slate-800 hover:text-white sm:w-auto"
          >
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
