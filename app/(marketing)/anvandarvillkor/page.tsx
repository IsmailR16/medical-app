import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { LegalDoc } from "@/components/marketing/LegalDoc";

export const metadata: Metadata = {
  title: "Användarvillkor",
  description:
    "Diagnostikas användarvillkor — vad du får och inte får göra på plattformen.",
};

export default async function AnvandarvillkorPage() {
  const filePath = path.join(process.cwd(), "docs", "legal", "terms-of-service.md");
  let content: string;
  try {
    content = await readFile(filePath, "utf8");
  } catch {
    content =
      "# Användarvillkor\n\n*Denna sida fylls med innehåll innan publik launch. Tills dess, kontakta privacy@diagnostika.se vid frågor.*";
  }

  return <LegalDoc title="Användarvillkor" content={content} />;
}
