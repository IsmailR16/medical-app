import type { Metadata } from "next";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/marketing/ScrollReveal";

export const metadata: Metadata = {
  title: {
    template: "%s | Diagnostika",
    default: "Diagnostika | Träna kliniskt resonemang med AI-patienter",
  },
  description:
    "En virtuell patientsimulatör för läkarstudenter att träna diagnostik, anamnestagning och kliniskt resonemang med realistiska AI-drivna patienter.",
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isSignedIn = cookieStore.has("__session");

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollReveal />
      <Navbar isSignedIn={isSignedIn} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
