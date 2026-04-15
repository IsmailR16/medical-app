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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Diagnostika",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "Virtuell patientsimulatör för läkarstudenter att träna diagnostik, anamnestagning och kliniskt resonemang med AI-drivna patienter.",
    url: "https://diagnostika.se",
    inLanguage: "sv",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "SEK",
        name: "Gratis",
      },
      {
        "@type": "Offer",
        price: "71",
        priceCurrency: "SEK",
        name: "Pro",
        billingPeriod: "P1M",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
