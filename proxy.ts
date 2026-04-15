import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from 'next/server';

const isSignInOrUpRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
]);

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/cases(.*)",
    "/sessions(.*)",
    "/billing(.*)",
    "/settings(.*)",
    "/evaluations(.*)",
    "/api/sessions(.*)",
    "/api/stripe(.*)",
]);

function middleware(req: NextRequest) {
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

      // Protected routes — require auth
      if (isProtectedRoute(req)) {
        const userAuth = await auth();
        if (!userAuth.userId) {
          return NextResponse.redirect(new URL("/sign-up", origin));
        }
      }

      return NextResponse.next();
    })(req, {} as any);
}

export default middleware;

export const config = {
  matcher: [
    // Only run middleware on auth pages and protected routes
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/dashboard/:path*",
    "/cases/:path*",
    "/sessions/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/evaluations/:path*",
    "/api/sessions/:path*",
    "/api/stripe/:path*",
  ],
};
