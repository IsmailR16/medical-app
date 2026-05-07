import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#1D3557] text-white/60">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <Image src="/Logo_white.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
              <span className="text-[15px] font-bold tracking-tight text-white">Diagnostika</span>
            </div>
            <p className="text-[13px] leading-relaxed text-white/40 max-w-xs">
              AI-driven klinisk träning för nästa generation läkare.
            </p>
          </div>

          {/* Produkt */}
          <div className="md:col-span-2 md:col-start-7">
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/30 mb-4">
              Produkt
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#funktioner"
                  className="text-[13px] hover:text-white transition-colors duration-300"
                >
                  Funktioner
                </a>
              </li>
              <li>
                <a
                  href="#priser"
                  className="text-[13px] hover:text-white transition-colors duration-300"
                >
                  Priser
                </a>
              </li>
              <li>
                <Link
                  href="/cases"
                  className="text-[13px] hover:text-white transition-colors duration-300"
                >
                  Fallbibliotek
                </Link>
              </li>
            </ul>
          </div>

          {/* Företag */}
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/30 mb-4">
              Företag
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-[13px] hover:text-white transition-colors duration-300"
                >
                  Om oss
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[13px] hover:text-white transition-colors duration-300"
                >
                  Kontakt
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[13px] hover:text-white transition-colors duration-300"
                >
                  Karriär
                </a>
              </li>
            </ul>
          </div>

          {/* Juridiskt */}
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/30 mb-4">
              Juridiskt
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/integritetspolicy"
                  className="text-[13px] hover:text-white transition-colors duration-300"
                >
                  Integritetspolicy
                </Link>
              </li>
              <li>
                <Link
                  href="/anvandarvillkor"
                  className="text-[13px] hover:text-white transition-colors duration-300"
                >
                  Användarvillkor
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social + copyright */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/30">
            &copy; 2026 Diagnostika. Alla rättigheter förbehållna.
          </p>
          <div className="flex items-center gap-4">
            {/* Twitter / X */}
            <a
              href="#"
              className="text-white/30 hover:text-white/60 transition-colors duration-300"
              aria-label="Twitter"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="#"
              className="text-white/30 hover:text-white/60 transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
