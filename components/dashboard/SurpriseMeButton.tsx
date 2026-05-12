"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowUpRight, Loader2 } from "lucide-react";

export function SurpriseMeButton() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const inflightRef = useRef(false);

  async function handleClick() {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setStarting(true);

    const toastId = toast.loading("Slumpar fall...");
    try {
      const res = await fetch("/api/sessions/start-random", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Kunde inte starta sessionen.");
      }
      const { sessionId } = await res.json();
      toast.success("Session startad ✅", { id: toastId });
      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel.", {
        id: toastId,
      });
      inflightRef.current = false;
      setStarting(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={starting}
      className="group inline-flex items-center gap-2 bg-[#e63946] text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#d62839] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_16px_-4px_rgba(230,57,70,0.4)] cursor-pointer"
    >
      {starting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
          Startar...
        </>
      ) : (
        <>
          Överraska mig
          <ArrowUpRight
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.5}
          />
        </>
      )}
    </button>
  );
}
