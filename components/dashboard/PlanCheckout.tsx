"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export function PlanCheckout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const triggered = useRef(false);
  const plan = searchParams.get("plan");

  useEffect(() => {
    if (!plan || plan === "free" || triggered.current) return;
    triggered.current = true;

    async function startCheckout() {
      const toastId = toast.loading("Skapar betalningssession…");

      try {
        const interval = searchParams.get("interval") === "monthly" ? "monthly" : "yearly";
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planType: `${plan}_${interval}` }),
        });

        if (!res.ok) {
          const errorBody = await res.text().catch(() => "Unknown error");
          console.error("Failed to create checkout session:", errorBody);
          toast.error("Ett fel inträffade. Försök igen senare.", { id: toastId });
          router.replace("/dashboard");
          return;
        }

        let data: { url?: string };
        try {
          data = await res.json();
        } catch {
          console.error("Invalid JSON response from checkout API");
          toast.error("Oväntat svar från servern. Försök igen.", { id: toastId });
          router.replace("/dashboard");
          return;
        }

        if (data.url) {
          toast.dismiss(toastId);
          window.location.href = data.url;
        } else {
          console.error("Checkout session URL missing from response");
          toast.error("Kunde inte skapa betalningslänk. Försök igen.", { id: toastId });
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Network error during checkout:", error);
        toast.error("Nätverksfel. Kontrollera din anslutning och försök igen.", { id: toastId });
        router.replace("/dashboard");
      }
    }

    startCheckout();
  }, [plan, router, searchParams]);

  return null;
}
