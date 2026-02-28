"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconPlayerPlay } from "@tabler/icons-react";
import type { CaseListItem } from "@/lib/db/dashboard";

interface CaseGridProps {
  cases: CaseListItem[];
  limitReached: boolean;
}

const difficultyLabel: Record<string, string> = {
  easy: "Lätt",
  medium: "Medel",
  hard: "Svår",
};

const difficultyVariant: Record<string, "default" | "secondary" | "outline"> = {
  easy: "outline",
  medium: "secondary",
  hard: "default",
};

export function CaseGrid({ cases, limitReached }: CaseGridProps) {
  const router = useRouter();
  const [startingId, setStartingId] = useState<string | null>(null);
  const inflightRef = useRef(false);

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

  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Inga patientfall tillgängliga just nu.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cases.map((c) => (
        <Card key={c.id} className="flex flex-col">
          <CardHeader className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{c.specialty}</Badge>
              <Badge variant={difficultyVariant[c.difficulty] ?? "outline"}>
                {difficultyLabel[c.difficulty] ?? c.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-base">{c.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {c.description}
            </CardDescription>
            <div className="pt-3">
              <Button
                size="sm"
                disabled={limitReached || startingId === c.id}
                onClick={() => handleStart(c.id)}
              >
                <IconPlayerPlay className="mr-1 size-4" />
                {startingId === c.id ? "Startar…" : "Starta"}
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
