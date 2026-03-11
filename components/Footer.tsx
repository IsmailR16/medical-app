import Link from "next/link";
import { Github } from "lucide-react";

const FOOTER_SECTIONS = [
  {
    title: "Produkt",
    links: [
      { label: "Funktioner", href: "/features" },
      { label: "Fallbibliotek", href: "/cases" },
      { label: "Priser", href: "/pricing" },
    ],
  },
  {
    title: "Resurser",
    links: [
      { label: "Vanliga frågor", href: "/faq" },
      { label: "Dokumentation", href: "#" },
      { label: "Integritetspolicy", href: "#" },
    ],
  },
  {
    title: "Kontakt",
    links: [
      { label: "Support", href: "#" },
      { label: "Försäljning", href: "#" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div
                className="flex h-7 w-7 items-center justify-center rounded bg-teal-700 text-xs font-bold"
                aria-hidden="true"
              >
                M
              </div>
              <span className="text-lg font-bold">MedSim AI</span>
            </div>
            <p className="text-sm leading-relaxed">
              Omdefinierar medicinsk utbildning genom högkvalitativa AI-simuleringar. Öva, lär och excellera.
            </p>
          </div>

          {/* Link sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                {section.title}
              </h3>
              <ul className="space-y-3 text-sm" role="list">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {section.title === "Kontakt" && (
                  <li className="mt-4 flex items-center gap-2" aria-label="GitHub">
                    <Github size={18} aria-hidden="true" />
                    <span>@medsim-ai</span>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-slate-800 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} MedSim AI. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}
