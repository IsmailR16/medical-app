import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | MedSim AI",
    default: "MedSim AI — Träna kliniskt resonemang med AI-patienter",
  },
  description:
    "En virtuell patientsimulatör för läkarstudenter att träna diagnostik, anamnestagning och kliniskt resonemang med realistiska AI-drivna patienter.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
