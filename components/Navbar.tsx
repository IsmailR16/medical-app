import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20 lg:px-8">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-sm font-semibold text-slate-700">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild className="rounded-xl bg-blue-600 px-5 text-sm font-semibold shadow-md hover:bg-blue-700">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm" aria-label="MedSim AI — Home">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white" aria-hidden="true">
        M
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        MedSim AI
      </span>
    </Link>
  );
}