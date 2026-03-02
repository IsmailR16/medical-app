"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface BillingActionsProps {
  mode: "upgrade" | "manage";
}

export default function BillingActions({ mode }: BillingActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Kunde inte starta checkout.");
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

  async function handleManage() {
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

  if (mode === "manage") {
    return (
      <Button variant="outline" disabled={loading} onClick={handleManage}>
        {loading ? "Laddar…" : "Hantera prenumeration"}
      </Button>
    );
  }

  return (
    <Button className="w-full mt-4" disabled={loading} onClick={handleUpgrade}>
      {loading ? "Laddar…" : "Uppgradera till Pro"}
    </Button>
  );
}
