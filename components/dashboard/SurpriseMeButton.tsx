"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Sparkles, X } from "lucide-react";

export function SurpriseMeButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 bg-[#e63946] text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#d62839] active:scale-[0.98] shadow-[0_4px_16px_-4px_rgba(230,57,70,0.4)] cursor-pointer"
      >
        Överraska mig
        <ArrowUpRight
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.5}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[70] bg-[#1d3557]/40 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="relative w-full max-w-[420px] bg-white rounded-2xl border border-[#1d3557]/[0.08] shadow-[0_24px_64px_-12px_rgba(29,53,87,0.25)] overflow-hidden pointer-events-auto"
              >
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Stäng"
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#1d3557] hover:bg-[#F9FAFB] transition-all duration-200 cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>

                <div className="px-8 pt-10 pb-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#457b9d]/15 to-[#a8dadc]/15 border border-[#1d3557]/[0.06] grid place-items-center mx-auto mb-5">
                    <Sparkles
                      className="w-6 h-6 text-[#457b9d]"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h2 className="text-xl font-extrabold text-[#1d3557] tracking-tight mb-2">
                    Kommer snart
                  </h2>
                  <p className="text-[14px] text-[#64748B] leading-relaxed max-w-[32ch] mx-auto">
                    Funktionen för att slumpa ett patientfall är under
                    utveckling. Håll utkik!
                  </p>

                  <button
                    onClick={() => setOpen(false)}
                    className="mt-6 inline-flex items-center justify-center bg-[#457b9d] text-white text-[13px] font-semibold rounded-xl px-6 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a6781] active:scale-[0.98] shadow-[0_2px_8px_-2px_rgba(69,123,157,0.3)] cursor-pointer"
                  >
                    Okej
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
