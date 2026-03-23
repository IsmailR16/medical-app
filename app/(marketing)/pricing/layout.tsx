import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Priser",
  description:
    "Enkel och transparent prissättning för MedSim AI. Börja gratis och uppgradera till Pro eller Institution.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
