import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AlertTriangle, Lock, Bell, Globe, Moon } from "lucide-react";

export const metadata: Metadata = {
  title: "Inställningar",
};

import { getOrCreateUser } from "@/lib/auth/user";
import SettingsActions from "./settings-actions";
import { TopBar } from "@/components/dashboard/TopBar";
import { FadeUp } from "@/components/dashboard/MotionWrappers";

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
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <FadeUp className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight">
            Inställningar
          </h1>
          <p className="text-[15px] text-[#94A3B8] mt-1">
            Hantera ditt konto och preferenser
          </p>
        </FadeUp>

        {/* Profile */}
        <FadeUp delay={0.08} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] mb-6">
          <div className="px-6 py-5 border-b border-[#1d3557]/[0.04]">
            <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
              Profil
            </h2>
            <p className="text-[13px] text-[#94A3B8] mt-1">
              Din profilinformation hanteras via Clerk
            </p>
          </div>

          <div className="px-6 py-6">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#457b9d] flex items-center justify-center overflow-hidden flex-shrink-0">
                {clerkUser.imageUrl ? (
                  <img
                    src={clerkUser.imageUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">{initials}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-[#1d3557] tracking-tight">
                  {fullName}
                </h3>
                <p className="text-[13px] text-[#94A3B8]">{email}</p>
                <span className="inline-flex items-center px-2 py-0.5 mt-1.5 text-[10px] font-semibold bg-[#457b9d]/[0.06] text-[#457b9d] rounded-md">
                  {(appUser?.plan ?? "free").charAt(0).toUpperCase() +
                    (appUser?.plan ?? "free").slice(1)}
                  -Plan
                </span>
              </div>
            </div>

            {/* Info fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1.5">
                  Förnamn
                </label>
                <p className="text-[13px] font-medium text-[#1d3557]">
                  {clerkUser.firstName ?? "—"}
                </p>
                <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1.5 mt-4">
                  E-post
                </label>
                <p className="text-[13px] font-medium text-[#457b9d]">
                  {email}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1.5">
                  Efternamn
                </label>
                <p className="text-[13px] font-medium text-[#1d3557]">
                  {clerkUser.lastName ?? "—"}
                </p>
                <label className="block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1.5 mt-4">
                  Konto skapat
                </label>
                <p className="text-[13px] font-medium text-[#1d3557]">
                  {new Date(clerkUser.createdAt).toLocaleDateString("sv-SE")}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1d3557]/[0.04]">
              <p className="text-[13px] text-[#94A3B8] mb-4">
                Vill du ändra namn, e-post eller lösenord? Använd knappen nedan
                för att öppna kontoinställningarna.
              </p>
              <SettingsActions />
            </div>
          </div>
        </FadeUp>

        {/* Notifications */}
        {/* <FadeUp delay={0.16} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] mb-6">
          <div className="px-6 py-5 border-b border-[#1d3557]/[0.04] flex items-center gap-2.5">
            <Bell className="w-[18px] h-[18px] text-[#457b9d]" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
              Aviseringar
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "E-postaviseringar", defaultOn: true },
              { label: "Prestationsrapporter", defaultOn: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#1d3557]/[0.04]"
              >
                <p className="text-[14px] font-semibold text-[#1d3557]">
                  {item.label}
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultOn}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-[22px] bg-zinc-200 rounded-full peer peer-checked:bg-[#457b9d] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:shadow-[0_1px_3px_rgba(0,0,0,0.1)] after:transition-all peer-checked:after:translate-x-full duration-300" />
                </label>
              </div>
            ))}
          </div>
        </FadeUp> */}

        {/* Security */}
        {/* <FadeUp delay={0.24} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] mb-6">
          <div className="px-6 py-5 border-b border-[#1d3557]/[0.04] flex items-center gap-2.5">
            <Lock className="w-[18px] h-[18px] text-[#457b9d]" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
              Säkerhet
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Lösenord", action: "Ändra lösenord" },
              { label: "Tvåfaktorsautentisering", action: "Aktivera" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#1d3557]/[0.04]"
              >
                <p className="text-[14px] font-semibold text-[#1d3557]">
                  {item.label}
                </p>
                <SettingsActions label={item.action} />
              </div>
            ))}
          </div>
        </FadeUp> */}

        {/* Preferences */}
        {/* <FadeUp delay={0.32} className="bg-white rounded-2xl border border-[#1d3557]/[0.06] shadow-[0_2px_8px_-4px_rgba(29,53,87,0.06)] mb-6">
          <div className="px-6 py-5 border-b border-[#1d3557]/[0.04] flex items-center gap-2.5">
            <Globe className="w-[18px] h-[18px] text-[#457b9d]" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-[#1d3557] tracking-tight">
              Preferenser
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-2">
                Språk
              </label>
              <select
                defaultValue="sv"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#1d3557]/[0.06] rounded-xl text-[13px] font-medium text-[#1d3557] focus:outline-none focus:border-[#457b9d]/40 focus:shadow-[0_0_0_3px_rgba(69,123,157,0.08)] transition-all duration-300 appearance-none cursor-pointer"
              >
                <option>Svenska</option>
                <option>Engelska</option>
                <option>Tyska</option>
                <option>Franska</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#1d3557]/[0.04]">
              <div className="flex items-center gap-2.5">
                <Moon
                  className="w-[18px] h-[18px] text-[#94A3B8]"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-[14px] font-semibold text-[#1d3557]">
                    Mörkt läge
                  </p>
                  <p className="text-[12px] text-[#94A3B8]">Kommer snart</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input type="checkbox" disabled className="sr-only peer" />
                <div className="w-10 h-[22px] bg-zinc-200 rounded-full opacity-40 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />
              </label>
            </div>
          </div>
        </FadeUp> */}

        {/* Farlig Zon */}
        <FadeUp delay={0.4} className="bg-white rounded-2xl border border-[#e63946]/[0.15] shadow-[0_2px_8px_-4px_rgba(230,57,70,0.06)]">
          <div className="px-6 py-5 border-b border-[#e63946]/[0.08] flex items-center gap-2.5">
            <AlertTriangle
              className="w-[18px] h-[18px] text-[#e63946]"
              strokeWidth={1.5}
            />
            <h2 className="text-lg font-bold text-[#e63946] tracking-tight">
              Farlig zon
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-[#e63946]/[0.02] rounded-xl border border-[#e63946]/[0.06]">
              <div>
                <p className="text-[14px] font-semibold text-[#1d3557]">
                  Radera konto
                </p>
                <p className="text-[13px] text-[#94A3B8]">
                  Permanent radera ditt konto och all din data. Kan inte ångras.
                </p>
              </div>
              <SettingsActions deleteMode />
            </div>
          </div>
        </FadeUp>
      </div>
    </>
  );
}
