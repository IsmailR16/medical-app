import "server-only";

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
 *
 * Server-only — must not be imported from client components.
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
