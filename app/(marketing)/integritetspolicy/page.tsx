import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { LegalDoc } from "@/components/marketing/LegalDoc";

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description:
    "Hur Diagnostika behandlar dina personuppgifter — kontaktuppgifter, lagringstider, rättigheter enligt GDPR.",
};

export default async function IntegritetspolicyPage() {
  const filePath = path.join(process.cwd(), "docs", "legal", "privacy-policy.md");
  const content = await readFile(filePath, "utf8");

  return <LegalDoc title="Integritetspolicy" content={content} />;
}
