import { getPriceId } from '@/lib/plans.server';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {

  try {
    // Authenticate server-side — never trust userId from the client
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    const { planType } = await request.json();

    if (!planType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }


    const allowedPlans = ['pro_monthly', 'pro_yearly'];
    if (!allowedPlans.includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const priceID = getPriceId(planType.split('_')[0], planType.split('_')[1] as 'monthly' | 'yearly');

    if (!priceID) {
      return NextResponse.json({ error: 'Price ID not found for the specified plan' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceID,
          quantity: 1,
        },
      ],
      customer_email: email,
      mode: "subscription",
      metadata: { clerkUserId: userId, planType },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    })

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
