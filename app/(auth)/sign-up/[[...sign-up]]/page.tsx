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
  // Send new users straight to /accept-terms — skips a full server roundtrip
  // through /dashboard which would just redirect here anyway. The plan param
  // is preserved and forwarded to /dashboard after acceptance.
  const redirectUrl = plan ? `/accept-terms?plan=${plan}` : "/accept-terms";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp forceRedirectUrl={redirectUrl} />
    </main>
  );
}
