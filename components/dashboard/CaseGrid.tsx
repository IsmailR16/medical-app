"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import { DifficultyBadge } from "@/components/dashboard/DifficultyBadge";
import type { CaseListItem } from "@/lib/db/dashboard";

/* ------------------------------------------------------------------ */

interface CaseGridProps {
  cases: CaseListItem[];
  limitReached: boolean;
}

const difficultyMap: Record<string, "easy" | "medium" | "hard"> = {
  Lätt: "easy",
  Medel: "medium",
  Svår: "hard",
};

export function CaseGrid({ cases, limitReached }: CaseGridProps) {
  const router = useRouter();
  const [startingId, setStartingId] = useState<string | null>(null);
  const inflightRef = useRef(false);

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

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
      if (difficulty !== "all" && c.difficulty !== difficulty) return false;
      return true;
    });
  }, [cases, search, specialty, difficulty]);

  const hasFilters = search || specialty !== "all" || difficulty !== "all";

  const clearFilters = () => {
    setSearch("");
    setSpecialty("all");
    setDifficulty("all");
  };

  /* ---------- Start session ---------- */
  const handleStart = useCallback(
    async (caseId: string) => {
      if (inflightRef.current) return;
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
        toast.success("Session startad ✅", { id: toastId });
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
    [router]
  );

  /* ---------- Render ---------- */
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="case-search">Sök fall</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="case-search"
              placeholder="Sök efter titel eller beskrivning…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty-filter">Specialitet</Label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger id="specialty-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla specialiteter</SelectItem>
              {specialties.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty-filter">Svårighetsgrad</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla nivåer</SelectItem>
              <SelectItem value="easy">Lätt</SelectItem>
              <SelectItem value="medium">Medel</SelectItem>
              <SelectItem value="hard">Svår</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Visar {filtered.length} av {cases.length} fall
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Rensa filter
          </Button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="hover:shadow-md transition-shadow border border-border flex flex-col"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {c.specialty}
                    </CardDescription>
                  </div>
                  <DifficultyBadge
                    difficulty={c.difficulty as "easy" | "medium" | "hard"}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {c.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full group"
                  disabled={limitReached || startingId === c.id}
                  onClick={() => handleStart(c.id)}
                >
                  {startingId === c.id ? "Startar…" : "Starta fall"}
                  <IconArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Inga fall matchade dina filter
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Rensa filter
          </Button>
        </div>
      )}
    </div>
  );
}
