import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Skapa konto | Diagnostika",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  // Always route through /dashboard. The (dashboard) layout gate redirects
  // to /accept-terms only when terms aren't accepted. This keeps a single
  // unified flow: new users get gated to accept-terms, while returning
  // (already-accepted) users who authenticate here go straight to the
  // dashboard — without briefly flashing the /accept-terms skeleton.
  const redirectUrl = plan ? `/dashboard?plan=${plan}` : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp forceRedirectUrl={redirectUrl} />
    </main>
  );
}
