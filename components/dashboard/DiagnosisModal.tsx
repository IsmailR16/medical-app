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
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [differentials, setDifferentials] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inflightRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setSubmitting(true);

    const toastId = toast.loading("Skickar inlämning…");

    try {
      const differential_diagnoses = differentials
        .split(/\n+/)
        .map((s) => s.replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean);

      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitDiagnosis: true,
          primary_diagnosis: primaryDiagnosis.trim(),
          differential_diagnoses,
          treatment_plan: treatmentPlan.trim(),
          reasoning: reasoning.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Kunde inte skicka inlämningen.");
      }

      const data = await res.json();

      if (data.evaluated) {
        const pct = Math.round((data.total_score ?? 0) * 100);
        toast.success(`Utvärderad! ${data.grade} (${pct}%) ✅`, { id: toastId });
      } else {
        toast.success("Inlämning mottagen ✅", { id: toastId });
      }

      onOpenChange(false);
      router.push(`/evaluations/${sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel.", { id: toastId });
    } finally {
      inflightRef.current = false;
      setSubmitting(false);
    }
  }, [sessionId, primaryDiagnosis, differentials, treatmentPlan, reasoning, onOpenChange, router]);

  const isValid =
    primaryDiagnosis.trim().length > 0 && treatmentPlan.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lämna in bedömning</DialogTitle>
          <DialogDescription>
            Ange din bedömning baserat på anamnes och beställda undersökningar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="primary_diagnosis">
              Primär diagnos <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="primary_diagnosis"
              placeholder="Ange din mest sannolika diagnos…"
              value={primaryDiagnosis}
              onChange={(e) => setPrimaryDiagnosis(e.target.value)}
              className="min-h-[60px]"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="differentials">Differentialdiagnoser</Label>
            <Textarea
              id="differentials"
              placeholder="En diagnos per rad, t.ex.&#10;Aortadissektion&#10;Lungemboli&#10;Pneumothorax"
              value={differentials}
              onChange={(e) => setDifferentials(e.target.value)}
              className="min-h-[80px]"
              disabled={submitting}
            />
            <p className="text-[11px] text-[#94A3B8]">En diagnos per rad</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">
              Handläggningsplan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="treatment"
              placeholder="Beskriv din föreslagna handläggning…"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              className="min-h-[100px]"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasoning">Kliniskt resonemang (valfritt)</Label>
            <Textarea
              id="reasoning"
              placeholder="Motivera kort varför du landar i din primära diagnos…"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              className="min-h-[70px]"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? "Skickar…" : "Lämna in och få feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
