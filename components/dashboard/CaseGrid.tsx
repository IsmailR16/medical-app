"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search, ArrowUpRight, X } from "lucide-react";
import type { CaseListItem } from "@/lib/db/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */

interface CaseGridProps {
  cases: CaseListItem[];
  limitReached: boolean;
  /** Map of case_id → existing active session_id, so clicking a case with an
   *  in-progress session resumes it instead of consuming a new usage credit. */
  activeSessions: Record<string, string>;
}

export function CaseGrid({ cases, limitReached, activeSessions }: CaseGridProps) {
  const router = useRouter();
  const [startingId, setStartingId] = useState<string | null>(null);
  const inflightRef = useRef(false);

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");

  // Derive unique specialties from data
  const specialties = useMemo(
    () => [...new Set(cases.map((c) => c.specialty))].sort(),
    [cases]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cases.filter((c) => {
      if (q && !c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)) return false;
      if (specialty !== "all" && c.specialty !== specialty) return false;
      return true;
    });
  }, [cases, search, specialty]);

  const hasFilters = search || specialty !== "all";

  const clearFilters = () => {
    setSearch("");
    setSpecialty("all");
  };

  /* ---------- Start or resume session ---------- */
  const handleStart = useCallback(
    async (caseId: string) => {
      if (inflightRef.current) return;

      // If user already has an active session for this case, resume it
      // instead of creating a new one (would consume a usage credit).
      const existingSessionId = activeSessions[caseId];
      if (existingSessionId) {
        router.push(`/sessions/${existingSessionId}`);
        return;
      }

      inflightRef.current = true;
      setStartingId(caseId);

      const toastId = toast.loading("Startar session…");

      try {
        const res = await fetch("/api/sessions/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? "Något gick fel vid start av sessionen."
          );
        }

        const { sessionId } = await res.json();
        toast.success("Session startad", { id: toastId });
        router.push(`/sessions/${sessionId}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Kunde inte starta sessionen.",
          { id: toastId }
        );
        inflightRef.current = false;
        setStartingId(null);
      }
    },
    [router, activeSessions]
  );

  /* ---------- Render ---------- */
  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#94A3B8] pointer-events-none"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Sök fall efter titel, kategori eller nyckelord..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-10 bg-white border border-[#1d3557]/[0.06] rounded-xl text-[13px] text-[#1d3557] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#457b9d]/40 focus:shadow-[0_0_0_3px_rgba(69,123,157,0.08)] transition-all duration-300"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Rensa sökning"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-[#94A3B8] hover:text-[#1d3557] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="!h-12 w-full sm:w-[220px] bg-white border-[#1d3557]/[0.06] rounded-xl text-[13px] font-medium text-[#1d3557] px-4 hover:border-[#1d3557]/[0.12] focus:border-[#457b9d]/40 focus:shadow-[0_0_0_3px_rgba(69,123,157,0.08)] transition-all duration-300 cursor-pointer shadow-none data-[placeholder]:text-[#94A3B8]">
            <SelectValue placeholder="Alla specialiteter" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            sideOffset={6}
            className="rounded-xl border-[#1d3557]/[0.08] shadow-[0_8px_30px_-6px_rgba(29,53,87,0.18)] max-h-[320px]"
          >
            <SelectItem
              value="all"
              className="text-[13px] text-[#1d3557] focus:bg-[#F9FAFB] cursor-pointer"
            >
              Alla specialiteter
            </SelectItem>
            {specialties.map((s) => (
              <SelectItem
                key={s}
                value={s}
                className="text-[13px] text-[#1d3557] focus:bg-[#F9FAFB] capitalize cursor-pointer"
              >
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#94A3B8]">
          Visar {filtered.length} av {cases.length} fall
        </p>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[13px] font-medium text-[#457b9d] hover:text-[#3a6781] transition-colors duration-200 cursor-pointer"
          >
            Rensa filter
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <button
              key={c.id}
              disabled={(limitReached && !activeSessions[c.id]) || startingId === c.id}
              onClick={() => handleStart(c.id)}
              className="group text-left bg-white rounded-2xl p-6 border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] hover:shadow-[0_12px_32px_-8px_rgba(29,53,87,0.12)] hover:border-[#1d3557]/[0.1] hover:-translate-y-1 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-[15px] font-bold text-[#1d3557] tracking-tight mb-1">
                    {c.title}
                  </h3>
                  <p className="text-[12px] font-medium text-[#457b9d]">
                    {c.specialty}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#F9FAFB] border border-[#1d3557]/[0.04] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-4 h-4 text-[#457b9d]" strokeWidth={1.5} />
                </div>
              </div>

              <p className="text-[13px] text-[#64748B] leading-relaxed line-clamp-2 flex-1">
                {c.description}
              </p>

              <div className="flex items-center gap-2 mt-5 min-h-[22px]">
                {activeSessions[c.id] && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-amber-50 text-amber-700 border-amber-200/50">
                    Pågående
                  </span>
                )}
                {startingId === c.id && (
                  <span className="text-[11px] text-[#94A3B8] font-medium">Startar…</span>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-[#1d3557]/[0.06]">
          <p className="text-[15px] font-medium text-[#1d3557] mb-1">
            Inga fall matchade dina filter
          </p>
          <p className="text-[13px] text-[#94A3B8] mb-6">
            Försök med andra sökord eller rensa filtren
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 bg-[#457b9d] text-white text-[13px] font-semibold rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a6781] active:scale-[0.98] cursor-pointer"
          >
            Rensa filter
          </button>
        </div>
      )}
    </div>
  );
}
