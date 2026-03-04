"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DiagnosisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

export function DiagnosisModal({
  open,
  onOpenChange,
  sessionId,
}: DiagnosisModalProps) {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inflightRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setSubmitting(true);

    const toastId = toast.loading("Skickar diagnos…");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `DIAGNOS: ${diagnosis.trim()}\n\nBEHANDLINGSPLAN: ${treatment.trim()}`,
          submitDiagnosis: true,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Kunde inte skicka diagnosen.");
      }

      const data = await res.json();

      if (data.evaluated) {
        toast.success(`Utvärderad! Poäng: ${data.score}/100 ✅`, { id: toastId });
      } else {
        toast.success("Diagnos inskickad! ✅", { id: toastId });
      }

      onOpenChange(false);
      router.push(`/evaluations/${sessionId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Något gick fel.",
        { id: toastId }
      );
    } finally {
      inflightRef.current = false;
      setSubmitting(false);
    }
  }, [sessionId, diagnosis, treatment, onOpenChange, router]);

  const isValid = diagnosis.trim().length > 0 && treatment.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submitta diagnos och behandling</DialogTitle>
          <DialogDescription>
            Ange din bedömning baserat på anamnes och undersökningar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnos</Label>
            <Textarea
              id="diagnosis"
              placeholder="Ange din huvuddiagnos och eventuella differentialdiagnoser…"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="min-h-[100px]"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="treatment">Behandlingsplan</Label>
            <Textarea
              id="treatment"
              placeholder="Beskriv din föreslagna behandlingsplan…"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="min-h-[100px]"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? "Skickar…" : "Submitta och få feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
