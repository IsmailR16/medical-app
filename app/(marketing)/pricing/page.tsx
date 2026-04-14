import { auth } from "@clerk/nextjs/server";
import PricingPage from "./PricingClient";

export default async function Page() {
  let isSignedIn = false;
  try {
    const { userId } = await auth();
    isSignedIn = !!userId;
  } catch {
    // auth() fails when middleware doesn't run on this route
  }
  return <PricingPage isSignedIn={isSignedIn} />;
}
