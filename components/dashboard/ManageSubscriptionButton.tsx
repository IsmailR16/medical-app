"use client";

import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Button that opens the Stripe Customer Portal so the user can
 * manage their subscription (cancel, update payment method, etc.).
 */
export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Kunde inte öppna hanteringssidan.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Nätverksfel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
    >
      {loading ? "Laddar…" : "Hantera prenumeration"}
    </button>
  );
}
