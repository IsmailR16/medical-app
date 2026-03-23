import type { Metadata } from "next";
import HeroSection from "@/components/marketing/HeroSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";

export const metadata: Metadata = {
  title: "MedSim AI — Träna kliniskt resonemang med AI-patienter",
  description:
    "Öva diagnostik, patientintervjuer och behandlingsplanering i en riskfri miljö med realistiska AI-patienter. Få realtidsfeedback.",
};
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import SocialProofSection from "@/components/marketing/SocialProofSection";
import CTASection from "@/components/marketing/CTASection";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <CTASection />
    </main>
  );
}
