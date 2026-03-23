import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Inställningar",
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getOrCreateUser } from "@/lib/auth/user";
import SettingsActions from "./settings-actions";
import { TopBar } from "@/components/dashboard/TopBar";

export default async function SettingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const appUser = await getOrCreateUser();

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    "Användare";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <TopBar title="Inställningar" />
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Inställningar</h1>
        <p className="text-muted-foreground">
          Hantera ditt konto och dina preferenser
        </p>
      </div>

      {/* Profile Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Din profilinformation hanteras via Clerk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={clerkUser.imageUrl} alt={fullName} />
              <AvatarFallback className="bg-[#0f766e] text-white text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{fullName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <Badge variant="outline" className="mt-2 capitalize">
                {appUser?.plan ?? "free"}-plan
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Förnamn</span>
                <p className="font-medium">{clerkUser.firstName ?? "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Efternamn</span>
                <p className="font-medium">{clerkUser.lastName ?? "-"}</p>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">E-post</span>
              <p className="font-medium">{email}</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Konto skapat</span>
              <p className="font-medium">
                {new Date(clerkUser.createdAt).toLocaleDateString("sv-SE")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Vill du ändra namn, e-post eller lösenord? Använd knappen nedan
              för att öppna kontoinställningarna.
            </p>
          </div>

          <SettingsActions />
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Notifikationer</CardTitle>
          <CardDescription>
            Hantera hur du vill få notifikationer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">E-postnotifikationer</p>
              <p className="text-sm text-muted-foreground">
                Få uppdateringar om nya patientfall via e-post
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-[#0f766e]"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Veckosammanfattning</p>
              <p className="text-sm text-muted-foreground">
                Få en sammanfattning av din progress varje vecka
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-[#0f766e]"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Produktuppdateringar</p>
              <p className="text-sm text-muted-foreground">
                Få information om nya funktioner och förbättringar
              </p>
            </div>
            <input type="checkbox" className="h-4 w-4 accent-[#0f766e]" />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Farlig zon</CardTitle>
          </div>
          <CardDescription>
            Permanenta åtgärder för ditt konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Radera konto</p>
              <p className="text-sm text-muted-foreground">
                Permanent radera ditt konto och all data. Denna åtgärd kan inte
                ångras.
              </p>
            </div>
            <SettingsActions deleteMode />
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
