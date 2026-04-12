"use client";

import { useClerk } from "@clerk/nextjs";
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

interface SettingsActionsProps {
  deleteMode?: boolean;
  label?: string;
}

export default function SettingsActions({ deleteMode, label }: SettingsActionsProps) {
  const { openUserProfile } = useClerk();

  if (deleteMode) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Radera konto</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du absolut säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna åtgärd kan inte ångras. Detta kommer permanent radera ditt
              konto och ta bort all din data från våra servrar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ja, radera mitt konto
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
