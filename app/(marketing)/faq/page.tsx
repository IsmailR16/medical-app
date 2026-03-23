import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vanliga frågor",
  description:
    "Svar på vanliga frågor om MedSim AI — priser, funktioner, prenumerationer och hur AI-patientsimuleringarna fungerar.",
};

export default function FAQPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Vanliga frågor</h1>
    </div>
  );
}