import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is not configured");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Stripe webhook signature verification failed:", message);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(session);
                break;
            }
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }
            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentFailed(invoice);
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }
            default:
                console.warn(`Unhandled Stripe event type: ${event.type}`);
        }
    } catch (err) {
        console.error(`Error handling Stripe event ${event.type}:`, err);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Map a Stripe subscription status string to our DB enum. */
function mapSubscriptionStatus(
    status: Stripe.Subscription.Status,
): "active" | "canceled" | "past_due" | "trialing" | "incomplete" {
    switch (status) {
        case "active":
            return "active";
        case "trialing":
            return "trialing";
        case "past_due":
            return "past_due";
        case "canceled":
        case "unpaid":
            return "canceled";
        case "incomplete":
        case "incomplete_expired":
            return "incomplete";
        default:
            return "incomplete";
    }
}

/** Derive the plan name from the Stripe planType metadata value (e.g. "pro_yearly" → "pro"). */
function derivePlan(planType: string | undefined): "free" | "pro" | "institution" {
    if (!planType) return "free";
    const name = planType.split("_")[0];
    if (name === "pro") return "pro";
    if (name === "institution") return "institution";
    return "free";
}

/**
 * In Stripe SDK v20+ current_period_start/end live on SubscriptionItem,
 * not on Subscription itself. Extract them from the first item.
 */
function getPeriodDates(subscription: Stripe.Subscription) {
    const item = subscription.items.data[0];
    if (!item) return { periodStart: null, periodEnd: null };
    return {
        periodStart: new Date(item.current_period_start * 1000).toISOString(),
        periodEnd: new Date(item.current_period_end * 1000).toISOString(),
    };
}

/** Extract subscription ID from an Invoice (v20+ moved it into parent.subscription_details). */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
    const sub = invoice.parent?.subscription_details?.subscription;
    if (!sub) return null;
    return typeof sub === "string" ? sub : sub.id;
}

/* ------------------------------------------------------------------ */
/*  Event handlers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Fired when a customer completes Stripe Checkout.
 * Links the Stripe customer + subscription to the Clerk user in Supabase
 * and activates their plan.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.clerkUserId;

    if (!userId) {
        console.error("No clerkUserId found in session metadata");
        return;
    }

    const subscriptionId = session.subscription as string | null;
    if (!subscriptionId) {
        console.error("No subscription ID found in checkout session");
        return;
    }

    // Fetch the full subscription to get period dates and status
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const { periodStart, periodEnd } = getPeriodDates(subscription);

    const plan = derivePlan(session.metadata?.planType);

    const supabase = createServiceRoleClient();
    const { error } = await supabase
        .from("users")
        .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            plan,
            subscription_status: mapSubscriptionStatus(subscription.status),
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

    if (error) {
        console.error("Failed to update user after checkout:", error);
        throw error; // surfaces a 500 so Stripe retries
    }

    console.log(`Activated ${plan} plan for user ${userId} (sub: ${subscriptionId})`);
}

/**
 * Fired whenever a subscription is updated (renewal, plan change,
 * cancel-at-period-end toggle, trial ending, etc.).
 * Keeps our DB in sync with the Stripe subscription state.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const { periodStart, periodEnd } = getPeriodDates(subscription);
    const supabase = createServiceRoleClient();

    const { error } = await supabase
        .from("users")
        .update({
            subscription_status: mapSubscriptionStatus(subscription.status),
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

    if (error) {
        console.error("Failed to update subscription:", error);
        throw error;
    }

    console.log(`Subscription ${subscription.id} updated → status: ${subscription.status}`);
}

/**
 * Fired when an invoice payment fails (e.g. card declined on renewal).
 * Marks the user's subscription as past_due so the UI can prompt for
 * payment method update.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);
    if (!subscriptionId) return;

    const supabase = createServiceRoleClient();

    const { error } = await supabase
        .from("users")
        .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);

    if (error) {
        console.error("Failed to mark subscription as past_due:", error);
        throw error;
    }

    console.log(`Subscription ${subscriptionId} marked past_due after failed invoice ${invoice.id}`);
}

/**
 * Fired when a subscription is fully cancelled (period ended or immediate cancel).
 * Downgrades the user back to the free plan.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const supabase = createServiceRoleClient();

    const { error } = await supabase
        .from("users")
        .update({
            plan: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
            current_period_start: null,
            current_period_end: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

    if (error) {
        console.error("Failed to downgrade user after subscription deletion:", error);
        throw error;
    }

    console.log(`Subscription ${subscription.id} deleted — user downgraded to free`);
}