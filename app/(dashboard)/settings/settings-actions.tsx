"use client";

import { useState, useRef } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsActionsProps {
  deleteMode?: boolean;
  label?: string;
}

const DELETE_CONFIRMATION = "RADERA";

export default function SettingsActions({ deleteMode, label }: SettingsActionsProps) {
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const inflightRef = useRef(false);

  async function handleDelete() {
    if (inflightRef.current || confirmText !== DELETE_CONFIRMATION) return;
    inflightRef.current = true;
    setDeleting(true);
    const toastId = toast.loading("Raderar konto...");
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Kunde inte radera kontot.");
      }
      toast.success("Ditt konto har raderats.", { id: toastId });
      setOpen(false);
      // Sign out via Clerk and redirect to landing
      await signOut({ redirectUrl: "/" });
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

  if (deleteMode) {
    return (
      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          if (deleting) return;
          setOpen(o);
          if (!o) setConfirmText("");
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Radera konto</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Radera ditt konto permanent</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                Detta tar bort ditt konto, alla sessioner, chatthistorik och utvärderingar.
                <strong className="text-rose-600"> Detta kan inte ångras.</strong>
              </span>
              <span className="block text-[13px] text-[#94A3B8]">
                Notera: Betalningshistorik hos Stripe behålls i 7 år enligt
                Bokföringslagen och kan inte raderas tidigare.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-delete" className="text-[13px]">
              Skriv <strong className="font-mono text-rose-600">{DELETE_CONFIRMATION}</strong> för att bekräfta
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={DELETE_CONFIRMATION}
              disabled={deleting}
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={confirmText !== DELETE_CONFIRMATION || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Raderar...
                </>
              ) : (
                "Ja, radera mitt konto"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <button
      onClick={() => openUserProfile()}
      className="px-4 py-2 bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#1d3557] text-[12px] font-semibold rounded-xl hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
    >
      {label ?? "Redigera profil"}
    </button>
  );
}
