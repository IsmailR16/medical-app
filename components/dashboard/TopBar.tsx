"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Menu, Settings, LogOut } from "lucide-react";
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
  const [bellOpen, setBellOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bellOpen]);

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
    <header className="sticky top-0 z-30 h-14 bg-[#F9FAFB]/80 backdrop-blur-xl border-b border-[#1d3557]/[0.04] flex items-center justify-between px-4 md:hidden">
      {/* Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white border border-transparent hover:border-[#1d3557]/[0.06] transition-all duration-300 cursor-pointer"
      >
        <Menu className="w-[18px] h-[18px] text-[#1d3557]" strokeWidth={1.5} />
      </button>

      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#1d3557]/[0.04] border border-[#1d3557]/[0.06] grid place-items-center flex-shrink-0">
          <Image
            src="/Logo_col.svg"
            alt="Logo"
            width={24}
            height={24}
            className="block m-0"
          />
        </div>
        <span className="text-[14px] font-bold text-[#1d3557] tracking-tight">
          Diagnostika
        </span>
      </Link>

      {/* Right side — bell + profile */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white border border-transparent hover:border-[#1d3557]/[0.06] hover:shadow-[0_2px_8px_-2px_rgba(29,53,87,0.08)] cursor-pointer"
          >
            <Bell
              className="w-[18px] h-[18px] text-[#64748B]"
              strokeWidth={1.5}
            />
          </button>

          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="absolute right-0 mt-2 w-[260px] z-50 bg-white rounded-xl border border-[#1d3557]/[0.08] shadow-[0_12px_40px_-8px_rgba(29,53,87,0.2)] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#1d3557]/[0.06]">
                  <p className="text-[13px] font-semibold text-[#1d3557]">
                    Notiser
                  </p>
                </div>
                <div className="px-4 py-8 flex flex-col items-center text-center">
                  <div className="w-11 h-11 rounded-2xl bg-[#457b9d]/[0.06] flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-[#94A3B8]" strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px] font-medium text-[#1d3557] mb-1">
                    Inga notiser just nu
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Vi meddelar dig när något händer
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 rounded-lg bg-[#457b9d] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#5a93b5] hover:shadow-[0_2px_12px_-2px_rgba(69,123,157,0.4)] cursor-pointer"
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
                    className="w-full px-4 py-2.5 text-left text-[13px] text-[#1d3557] hover:bg-[#F9FAFB] transition-colors duration-200 flex items-center gap-2.5 cursor-pointer"
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
                    className="w-full px-4 py-2.5 text-left text-[13px] text-[#1d3557] hover:bg-[#F9FAFB] transition-colors duration-200 flex items-center gap-2.5 border-t border-[#1d3557]/[0.04] cursor-pointer"
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
