"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/dashboard/DifficultyBadge";
import { DiagnosisModal } from "@/components/dashboard/DiagnosisModal";
import { IconFileText } from "@tabler/icons-react";

interface SessionHeaderProps {
  sessionId: string;
  title: string;
  specialty: string;
  difficulty: string;
  status: string;
  description: string;
}

export function SessionHeader({
  sessionId,
  title,
  specialty,
  difficulty,
  status,
  description,
}: SessionHeaderProps) {
  const [showDiagnosis, setShowDiagnosis] = useState(false);

  const isActive = status === "active";

  const statusLabel =
    status === "active"
      ? "Pågående"
      : status === "submitted"
        ? "Inskickad"
        : "Utvärderad";

  return (
    <>
      <div className="mb-6 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold truncate">{title}</h1>
              <DifficultyBadge
                difficulty={difficulty as "easy" | "medium" | "hard"}
              />
              <Badge variant="outline">{specialty}</Badge>
              <Badge
                variant="secondary"
                className="capitalize"
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          {isActive && (
            <Button
              onClick={() => setShowDiagnosis(true)}
              size="lg"
              className="shrink-0"
            >
              <IconFileText className="mr-2 size-4" />
              Submitta diagnos
            </Button>
          )}
        </div>
      </div>

      <DiagnosisModal
        open={showDiagnosis}
        onOpenChange={setShowDiagnosis}
        sessionId={sessionId}
      />
    </>
  );
}
