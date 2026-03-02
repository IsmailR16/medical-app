import { Brain, Shield, Zap } from "lucide-react";
import type { ReactNode } from "react";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Brain aria-hidden="true" />,
    title: "Cognitive Depth",
    description:
      "Patients remember history, respond to nuanced questions, and display realistic emotional states grounded in case data.",
  },
  {
    icon: <Shield aria-hidden="true" />,
    title: "Risk-Free Practice",
    description:
      "Simulate high-stakes clinical encounters without risk. Learn from mistakes in a controlled, judgment-free setting.",
  },
  {
    icon: <Zap aria-hidden="true" />,
    title: "Real-time Analytics",
    description:
      "Detailed rubrics break down your diagnostic performance across history taking, examination, and treatment plan.",
  },
];

export default function FeaturesSection() {
  return (
    <section aria-labelledby="features-heading" className="px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 id="features-heading" className="sr-only">
          Key Features
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className="group rounded-3xl border border-slate-100 bg-white p-8 transition-shadow hover:shadow-xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white">
        {feature.icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-slate-900 lg:text-2xl">
        {feature.title}
      </h3>
      <p className="leading-relaxed text-slate-500">{feature.description}</p>
    </article>
  );
}
