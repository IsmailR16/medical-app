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
  const redirectUrl = plan ? `/dashboard?plan=${plan}` : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp forceRedirectUrl={redirectUrl} />
    </main>
  );
}
