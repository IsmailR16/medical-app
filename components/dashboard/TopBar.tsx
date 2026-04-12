"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Menu, Stethoscope, Settings, LogOut } from "lucide-react";
import { useSidebarCtx } from "./SidebarContext";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { setMobileOpen } = useSidebarCtx();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const initials = user
    ? (user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "U")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "";
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#F9FAFB]/80 backdrop-blur-xl border-b border-[#1d3557]/[0.04] flex items-center justify-between px-4 md:px-8">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white border border-transparent hover:border-[#1d3557]/[0.06] transition-all duration-300"
      >
        <Menu className="w-[18px] h-[18px] text-[#1d3557]" strokeWidth={1.5} />
      </button>

      {/* Mobile brand */}
      <div className="md:hidden flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[#457b9d] flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <span className="text-[14px] font-bold text-[#1d3557] tracking-tight">
          Diagnostika
        </span>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden md:block" />

      {/* Right side — bell + profile */}
      <div className="flex items-center gap-2 md:gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white border border-transparent hover:border-[#1d3557]/[0.06] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)]">
          <Bell
            className="w-[18px] h-[18px] text-[#64748B]"
            strokeWidth={1.5}
          />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#e63946] rounded-full" />
        </button>

        {/* Profile avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 rounded-lg bg-[#457b9d] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#5a93b5] hover:shadow-[0_2px_12px_-2px_rgba(69,123,157,0.4)]"
          >
            <span className="text-white text-[11px] font-semibold">
              {initials}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                {/* Backdrop shadow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  className="absolute right-0 mt-2 w-48 sm:w-52 z-50 bg-white rounded-xl shadow-[0_12px_40px_-8px_rgba(29,53,87,0.2),0_0_0_1px_rgba(29,53,87,0.04)] border border-[#1d3557]/[0.06] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#1d3557]/[0.04]">
                  <p className="text-[13px] font-semibold text-[#1d3557]">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">{displayEmail}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/settings");
                    }}
                    className="w-full px-4 py-2.5 text-left text-[13px] text-[#1d3557] hover:bg-[#F9FAFB] transition-colors duration-200 flex items-center gap-2.5"
                  >
                    <Settings
                      className="w-4 h-4 text-[#94A3B8]"
                      strokeWidth={1.5}
                    />
                    Inställningar
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      signOut();
                    }}
                    className="w-full px-4 py-2.5 text-left text-[13px] text-[#1d3557] hover:bg-[#F9FAFB] transition-colors duration-200 flex items-center gap-2.5 border-t border-[#1d3557]/[0.04]"
                  >
                    <LogOut
                      className="w-4 h-4 text-[#94A3B8]"
                      strokeWidth={1.5}
                    />
                    Logga ut
                  </button>
                </div>
              </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
