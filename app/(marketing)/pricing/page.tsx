import { cookies } from "next/headers";
import PricingPage from "./PricingClient";

export default async function Page() {
  const cookieStore = await cookies();
  const isSignedIn = cookieStore.has("__session");
  return <PricingPage isSignedIn={isSignedIn} />;
}
