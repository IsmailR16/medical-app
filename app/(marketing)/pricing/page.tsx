import { auth } from "@clerk/nextjs/server";
import PricingPage from "./PricingClient";

export default async function Page() {
  const { userId } = await auth();
  return <PricingPage isSignedIn={!!userId} />;
}
