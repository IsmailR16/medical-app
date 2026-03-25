"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/features", label: "Funktioner" },
  { href: "/pricing", label: "Priser" },
  { href: "/faq", label: "Vanliga frågor" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:h-20 lg:px-8">
        <div className="flex-1">
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded-sm"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3">
          <SignedOut>
            <SignInButton>
              <Button variant="ghost" className="hidden text-sm font-semibold text-slate-700 md:inline-flex">
                Logga in
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="hidden rounded-xl bg-teal-700 px-5 text-sm font-semibold shadow-md hover:bg-teal-800 md:inline-flex">
                Kom igång
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Öppna meny"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Meny</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <SignedOut>
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 px-4 pt-4">
                  <SignInButton>
                    <Button
                      variant="outline"
                      className="w-full text-sm font-semibold"
                      onClick={() => setOpen(false)}
                    >
                      Logga in
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button
                      className="w-full rounded-xl bg-teal-700 text-sm font-semibold shadow-md hover:bg-teal-800"
                      onClick={() => setOpen(false)}
                    >
                      Kom igång
                    </Button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded-sm" aria-label="MedSim AI — Hem">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white" aria-hidden="true">
        M
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        MedSim AI
      </span>
    </Link>
  );
}