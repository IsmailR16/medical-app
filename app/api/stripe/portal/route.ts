import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session for the authenticated user
 * so they can manage their subscription (cancel, change payment method,
 * view invoices, etc.).
 */
export async function POST() {
  try {
    // Authenticate server-side
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up the user's Stripe customer ID from Supabase
    const supabase = createServiceRoleClient();
    const { data: user, error: dbError } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (dbError || !user) {
      console.error("Failed to fetch user for portal:", dbError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found. Please subscribe first." },
        { status: 400 },
      );
    }

    // Create a Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating Stripe portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}
