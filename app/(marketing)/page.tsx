import type { Metadata } from "next";
import HeroSection from "@/components/marketing/HeroSection";
import TrustedBySection from "@/components/marketing/TrustedBySection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import SocialProofSection from "@/components/marketing/SocialProofSection";
import PricingSection from "@/components/marketing/PricingSection";
import CTASection from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "Diagnostika | Träna kliniskt resonemang med AI-patienter",
  description:
    "Öva diagnostik, patientintervjuer och behandlingsplanering i en riskfri miljö med realistiska AI-patienter. Få realtidsfeedback.",
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <CTASection />
    </>
  );
}
