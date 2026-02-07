import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Stethoscope,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: <Stethoscope className="size-6" aria-hidden="true" />,
    title: "Select a Case",
    description:
      "Browse our curated case library by specialty and difficulty. Each case has a real patient with a hidden diagnosis.",
  },
  {
    number: "02",
    icon: <MessageSquare className="size-6" aria-hidden="true" />,
    title: "Interview the Patient",
    description:
      "Ask questions in natural language. The AI patient responds realistically — only revealing what a real patient would know.",
  },
  {
    number: "03",
    icon: <ClipboardCheck className="size-6" aria-hidden="true" />,
    title: "Submit Your Diagnosis",
    description:
      "Provide your primary diagnosis, differential diagnoses, and proposed treatment plan based on your findings.",
  },
  {
    number: "04",
    icon: <BarChart3 className="size-6" aria-hidden="true" />,
    title: "Get Detailed Feedback",
    description:
      "Receive a structured rubric with scores, missed findings, and personalized learning points to improve.",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-slate-50 px-6 py-20 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2
            id="how-it-works-heading"
            className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
          >
            How It Works
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Four steps to sharpen your clinical reasoning skills.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {STEPS.map((step) => (
            <li key={step.number} className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-8">
              <span className="mb-4 text-4xl font-black text-blue-100 lg:text-5xl">
                {step.number}
              </span>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {step.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
