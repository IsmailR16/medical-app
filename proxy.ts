import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isSignInOrUpRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
])

export default clerkMiddleware(async (auth, req) => {
    const { origin } = req.nextUrl;

    // Signed-in users hitting sign-in/up → redirect to dashboard
    if (isSignInOrUpRoute(req)) {
      const userAuth = await auth();
      if (userAuth.userId) {
        const plan = req.nextUrl.searchParams.get("plan");
        const target = new URL("/dashboard", origin);
        if (plan) target.searchParams.set("plan", plan);
        return NextResponse.redirect(target);
      }
      return NextResponse.next();
    }

    // Everything else (dashboard, api) — require auth
    const userAuth = await auth();
    if (!userAuth.userId) {
      return NextResponse.redirect(new URL("/sign-up", origin));
    }

    return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclude: Next.js internals, static files, and public marketing pages (/, /faq, /pricing, /features, /api/webhooks)
    // Everything else runs through Clerk middleware (protected by default)
    "/((?!_next|faq|pricing|features|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).+)",
  ],
};
