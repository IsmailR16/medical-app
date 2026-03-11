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
    title: "Kognitivt djup",
    description:
      "Patienterna minns sin historik, svarar på nyanserade frågor och visar realistiska känslotillstånd grundade i falldata.",
  },
  {
    icon: <Shield aria-hidden="true" />,
    title: "Riskfri träning",
    description:
      "Simulera högriskscenarier i kliniska möten utan risk. Lär dig av misstag i en kontrollerad och dömningsfri miljö.",
  },
  {
    icon: <Zap aria-hidden="true" />,
    title: "Realtidsanalys",
    description:
      "Detaljerade bedömningsrubriker bryter ner din diagnostiska prestation inom anamnestagning, undersökning och behandlingsplan.",
  },
];

export default function FeaturesSection() {
  return (
    <section aria-labelledby="features-heading" className="px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 id="features-heading" className="sr-only">
          Nyckelfunktioner
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
