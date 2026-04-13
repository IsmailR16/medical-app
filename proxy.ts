import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher ([
    "/",
    "/faq",
    "/pricing",
    "/features",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks/stripe(.*)",
])

const isSignInOrUpRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
])

export default clerkMiddleware(async (auth, req) => {
    const { pathname, origin } = req.nextUrl;

    // Public marketing routes — skip auth entirely
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

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
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
