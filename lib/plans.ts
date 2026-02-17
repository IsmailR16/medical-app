export interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted?: boolean;
  cta: string;
  href: string;
  features: string[];
  excluded?: string[];
}

export const PLANS: Plan[] = [
  {
    name: "Gratis",
    description:
      "Perfekt för att testa AI-patientsimuleringar och utforska plattformen.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Kom igång",
    href: "/sign-up",
    features: [
      "3 AI-patientfall per månad",
      "Grundläggande diagnostisk feedback",
      "Tillgång till communityn",
      "Standard svarstid",
    ],
    excluded: [
      "Avancerad analyspanel",
      "Skapa egna patientfall",
      "Prioriterad support",
      "Teamsamarbete",
    ],
  },
  {
    name: "Pro",
    description:
      "För läkarstudenter som vill bemästra kliniskt resonemang på allvar.",
    monthlyPrice: 299,
    yearlyPrice: 199,
    highlighted: true,
    cta: "Starta gratis provperiod",
    href: "/sign-up?plan=pro",
    features: [
      "Obegränsade AI-patientfall",
      "Avancerad diagnostisk analys",
      "Skapa egna patientfall",
      "Prioriterad svarstid",
      "Detaljerade bedömningsrubriker",
      "Exportera sessionsrapporter",
      "Prioriterad e-postsupport",
    ],
    excluded: [
      "Teamsamarbete",
    ],
  },
  {
    name: "Institution",
    description:
      "Byggd för universitet och undervisningssjukhus som hanterar studentgrupper.",
    monthlyPrice: 999,
    yearlyPrice: 799,
    cta: "Kontakta sälj",
    href: "/sign-up?plan=institution",
    features: [
      "Allt i Pro",
      "Obegränsat antal teammedlemmar",
      "Admin-panel & analys",
      "Anpassad läroplansintegration",
      "SSO & SAML-autentisering",
      "Dedikerad kontoansvarig",
      "SLA & driftsgaranti",
      "Möjlighet till lokal installation",
    ],
  },
];

export type BillingInterval = "monthly" | "yearly";

const PRICE_IDS: Record<string, Record<BillingInterval, string | null>> = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? null,
  },
};

/**
 * Returns the Stripe Price ID for a given plan and billing interval.
 * Throws if the plan has no associated price (e.g. "Gratis" or "Institution").
 */
export function getPriceId(planName: string, interval: BillingInterval): string {
  const key = planName.toLowerCase();
  const priceId = PRICE_IDS[key]?.[interval];

  if (!priceId) {
    throw new Error(
      `No Stripe Price ID configured for plan "${planName}" (${interval})`
    );
  }

  return priceId;
}

export const FAQ: { question: string; answer: string }[] = [
  {
    question: "Kan jag byta plan när som helst?",
    answer:
      "Ja. Du kan uppgradera, nedgradera eller avsluta din plan när som helst från dina kontoinställningar. Ändringar träder i kraft vid nästa faktureringsperiod.",
  },
  {
    question: "Finns det en gratis provperiod för Pro-planen?",
    answer:
      "Absolut — varje Pro-prenumeration börjar med en 14 dagars gratis provperiod. Inget kreditkort krävs för att börja.",
  },
  {
    question: "Vilka betalningsmetoder accepterar ni?",
    answer:
      "Vi accepterar alla vanliga kredit- och betalkort (Visa, Mastercard, Amex) samt PayPal. Institutionsplaner kan även betala via faktura.",
  },
  {
    question: "Erbjuder ni studentrabatt?",
    answer:
      "Ja! Verifierade studenter får ytterligare 20% rabatt på Pro-planen. Verifiera din studentstatus i kontoinställningarna efter registrering.",
  },
  {
    question: "Vad händer med min data om jag avslutar?",
    answer:
      "Dina sessionsdata och rapporter sparas i 90 dagar efter avslutning, så att du hinner exportera allt du behöver.",
  },
];