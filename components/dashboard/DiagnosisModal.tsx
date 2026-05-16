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

// Per-field character caps. Sum (+ rendered labels/newlines) must stay under
// MAX_SUBMISSION_LENGTH (6500) in /api/sessions/[id]/messages so a maxed-out
// form is never rejected server-side.
const MAX_DIAGNOSIS = 150;
const MAX_DIFFERENTIALS = 300;
const MAX_TREATMENT = 1000;
const MAX_REASONING = 1000;

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

    // Progress messages cycled while AI is grading. Mirrors the actual
    // server-side work (5 rubric areas + meta in parallel) — even though
    // those run concurrently, presenting them sequentially gives the user
    // a sense of progress instead of an opaque spinner for 20-30s.
    const progressMessages = [
      "Skickar inlämning…",
      "AI granskar din anamnes…",
      "Bedömer beställda undersökningar…",
      "Värderar kliniskt resonemang…",
      "Sammanställer återkoppling…",
      "Snart klart…",
    ];
    const STEP_MS = 5000;
    // Fixed width so the toast doesn't visually "pulse" wider/narrower
    // every time we cycle to a message of different length. Sized for the
    // longest message ("Bedömer beställda undersökningar…").
    const LOADING_TOAST_STYLE = { minWidth: "320px" };

    const toastId = toast.loading(progressMessages[0], { style: LOADING_TOAST_STYLE });
    let messageIndex = 0;
    const progressInterval = setInterval(() => {
      messageIndex = Math.min(messageIndex + 1, progressMessages.length - 1);
      toast.loading(progressMessages[messageIndex], {
        id: toastId,
        style: LOADING_TOAST_STYLE,
      });
    }, STEP_MS);

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
        toast.success(`Utvärderad! ${data.grade} (${pct}%)`, { id: toastId });
      } else {
        toast.success("Inlämning mottagen", { id: toastId });
      }

      onOpenChange(false);
      router.push(`/evaluations/${sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel.", { id: toastId });
    } finally {
      clearInterval(progressInterval);
      inflightRef.current = false;
      setSubmitting(false);
    }
  }, [sessionId, primaryDiagnosis, differentials, treatmentPlan, reasoning, onOpenChange, router]);

  const isValid =
    primaryDiagnosis.trim().length > 0 && treatmentPlan.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Lämna in bedömning</DialogTitle>
          <DialogDescription>
            Ange din bedömning baserat på anamnes och beställda undersökningar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto min-h-0 px-1">
          <div className="space-y-2">
            <Label htmlFor="primary_diagnosis">
              Primär diagnos <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="primary_diagnosis"
              placeholder="Ange din mest sannolika diagnos…"
              value={primaryDiagnosis}
              onChange={(e) => setPrimaryDiagnosis(e.target.value)}
              maxLength={MAX_DIAGNOSIS}
              className="min-h-[60px] max-h-40 overflow-y-auto resize-none [field-sizing:fixed] break-words"
              disabled={submitting}
            />
            <p className="text-[11px] text-[#94A3B8] text-right">
              {primaryDiagnosis.length}/{MAX_DIAGNOSIS}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="differentials">Differentialdiagnoser</Label>
            <Textarea
              id="differentials"
              placeholder="En diagnos per rad, t.ex.&#10;Aortadissektion&#10;Lungemboli&#10;Pneumothorax"
              value={differentials}
              onChange={(e) => setDifferentials(e.target.value)}
              maxLength={MAX_DIFFERENTIALS}
              className="min-h-[80px] max-h-40 overflow-y-auto resize-none [field-sizing:fixed] break-words"
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#94A3B8]">En diagnos per rad</p>
              <p className="text-[11px] text-[#94A3B8]">
                {differentials.length}/{MAX_DIFFERENTIALS}
              </p>
            </div>
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
              maxLength={MAX_TREATMENT}
              className="min-h-[100px] max-h-56 overflow-y-auto resize-none [field-sizing:fixed] break-words"
              disabled={submitting}
            />
            <p className="text-[11px] text-[#94A3B8] text-right">
              {treatmentPlan.length}/{MAX_TREATMENT}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasoning">Kliniskt resonemang (valfritt)</Label>
            <Textarea
              id="reasoning"
              placeholder="Motivera kort varför du landar i din primära diagnos…"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              maxLength={MAX_REASONING}
              className="min-h-[70px] max-h-56 overflow-y-auto resize-none [field-sizing:fixed] break-words"
              disabled={submitting}
            />
            <p className="text-[11px] text-[#94A3B8] text-right">
              {reasoning.length}/{MAX_REASONING}
            </p>
          </div>
        </div>

        <DialogFooter className="shrink-0">
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
