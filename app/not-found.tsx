import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: "Sidan hittades inte | Diagnostika",
  description: "Sidan du letar efter finns inte eller har flyttats.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-white flex items-center justify-center p-6">
      <div className="relative w-full max-w-[560px]">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#457b9d]/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#a8dadc]/[0.12] blur-3xl" />

        <div className="relative bg-white rounded-3xl border border-[#1d3557]/[0.06] shadow-[0_8px_32px_-8px_rgba(29,53,87,0.08)] p-8 md:p-12 text-center">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Diagnostika"
            className="inline-flex items-center justify-center mb-8 transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/Logo_col.svg"
              alt="Diagnostika"
              width={48}
              height={48}
              priority
            />
          </Link>

          {/* Big 404 */}
          <p className="font-mono text-[88px] md:text-[112px] font-extrabold tracking-tight leading-none bg-gradient-to-br from-[#1d3557] via-[#457b9d] to-[#a8dadc] bg-clip-text text-transparent select-none">
            404
          </p>

          {/* Heading + description */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1d3557] tracking-tight mt-3 mb-3">
            Sidan hittades inte
          </h1>
          <p className="text-[15px] text-[#64748B] leading-relaxed max-w-[40ch] mx-auto mb-8">
            Sidan du letade efter finns inte, har flyttats eller så stavades
            länken fel. Gå tillbaka till hemsidan eller hoppa in i din dashboard.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#F9FAFB] border border-[#1d3557]/[0.06] text-[#1d3557] text-[13px] font-semibold rounded-xl px-5 py-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#1d3557]/[0.12] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Till hemsidan
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-[#457b9d] text-white text-[13px] font-semibold rounded-xl px-5 py-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a6781] active:scale-[0.98] shadow-[0_4px_16px_-4px_rgba(69,123,157,0.4)] cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
              Till dashboard
            </Link>
          </div>

          {/* Footer hint */}
          <p className="mt-8 text-[12px] text-[#94A3B8]">
            Tror du detta är ett fel?{" "}
            <a
              href="mailto:kontakt@diagnostika.se"
              className="text-[#457b9d] hover:text-[#3a6781] font-medium transition-colors"
            >
              Kontakta oss
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
