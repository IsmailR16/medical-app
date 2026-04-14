import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from 'next/server';

const isSignInOrUpRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
])

function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Landing page — fast cookie check, no Clerk SDK
    if (pathname === "/") {
      const hasSession = req.cookies.has("__session");
      if (hasSession) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // All other matched routes — full Clerk auth
    return clerkMiddleware(async (auth, req) => {
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
    })(req, {} as any);
}

export default middleware;

export const config = {
  matcher: [
    // Landing page — lightweight cookie check (no Clerk)
    "/",
    // Protected by default — exclude: Next.js internals, static files, and public marketing routes
    "/((?!_next|faq$|faq/|pricing$|pricing/|features$|features/|api/webhooks/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).+)",
  ],
};
