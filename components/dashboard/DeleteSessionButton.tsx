"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteSessionButtonProps {
  sessionId: string;
  caseTitle: string;
}

export function DeleteSessionButton({ sessionId, caseTitle }: DeleteSessionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inflightRef = useRef(false);

  async function handleDelete() {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setDeleting(true);
    const toastId = toast.loading("Raderar session...");
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Kunde inte radera sessionen.");
      }
      toast.success("Sessionen har raderats.", { id: toastId });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel.", {
        id: toastId,
      });
    } finally {
      inflightRef.current = false;
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !deleting && setOpen(o)}>
      <AlertDialogTrigger asChild>
        <button
          aria-label="Radera session"
          disabled={deleting}
          className="p-2 rounded-xl text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Radera session?</AlertDialogTitle>
          <AlertDialogDescription>
            Sessionen <strong>&quot;{caseTitle}&quot;</strong> raderas permanent
            inklusive chatthistorik och eventuell utvärdering. Detta kan inte
            ångras.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Raderar...
              </>
            ) : (
              "Radera"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
