"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  BookOpen,
  History,
  ClipboardCheck,
  CreditCard,
  Settings,
  ChevronLeft,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useSidebarCtx } from "./SidebarContext";

const navGroups = [
  {
    label: "HUVUDMENY",
    items: [
      { path: "/dashboard", label: "Översikt", icon: LayoutDashboard },
      { path: "/cases", label: "Fallbibliotek", icon: BookOpen },
      { path: "/sessions", label: "Historik", icon: History },
    ],
  },
  {
    label: "ANALYS",
    items: [
      { path: "/evaluations", label: "Utvärderingar", icon: ClipboardCheck },
    ],
  },
  {
    label: "KONTO",
    items: [
      { path: "/billing", label: "Fakturering", icon: CreditCard },
      { path: "/settings", label: "Inställningar", icon: Settings },
    ],
  },
];

interface AppSidebarProps {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
    plan: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { mobileOpen, setMobileOpen, collapsed, toggleCollapsed } =
    useSidebarCtx();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showLabels = !collapsed;
  const desktopWidth = collapsed ? "md:w-[72px]" : "md:w-[260px]";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#1d3557] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          w-[260px] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 ${desktopWidth}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src="/Logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-5 h-5 object-cover"
              />
            </div>
            {(mobileOpen || showLabels) && (
              <span className="text-[15px] font-bold text-white tracking-tight whitespace-nowrap">
                Diagnostika
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation with groups */}
        <nav className="flex-1 px-3 pt-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              {(mobileOpen || showLabels) && (
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] px-3 mb-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.path ||
                    (item.path !== "/dashboard" &&
                      pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap ${
                        isActive
                          ? "bg-white/[0.1] text-white"
                          : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                      }`}
                    >
                      <Icon
                        className="w-[18px] h-[18px] flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      {(mobileOpen || showLabels) && (
                        <span className="text-[13px] font-medium">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User card */}
        <UserCardDropdown
          user={user}
          initials={initials}
          showLabels={mobileOpen || showLabels}
          collapsed={collapsed}
          signOut={signOut}
        />

        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white rounded-full border border-[#1d3557]/[0.08] shadow-[0_2px_8px_-2px_rgba(29,53,87,0.15)] items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110"
        >
          <ChevronLeft
            className={`w-3.5 h-3.5 text-[#1d3557] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              collapsed ? "rotate-180" : ""
            }`}
            strokeWidth={2}
          />
        </button>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  User card with dropdown popover                                    */
/* ------------------------------------------------------------------ */

function UserCardDropdown({
  user,
  initials,
  showLabels,
  collapsed,
  signOut,
}: {
  user: AppSidebarProps["user"];
  initials: string;
  showLabels: boolean;
  collapsed: boolean;
  signOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="px-3 pb-4 relative" ref={ref}>
      {/* Popover — anchored above the trigger */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className={`absolute z-[60] bg-white rounded-xl border border-[#1d3557]/[0.08] shadow-[0_8px_30px_-6px_rgba(29,53,87,0.18)] overflow-hidden ${
              collapsed
                ? "bottom-full left-[72px] mb-0 -translate-x-1/2 md:left-full md:bottom-2 md:mb-0 md:ml-3 md:translate-x-0 w-[240px]"
                : "bottom-full left-3 right-3 mb-2"
            }`}
          >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#1d3557]/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#457b9d] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#1d3557] truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#94A3B8] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-[#1d3557] hover:bg-[#F9FAFB] transition-colors duration-150"
            >
              <User className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
              Profil
            </Link>
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-[#1d3557] hover:bg-[#F9FAFB] transition-colors duration-150"
            >
              <CreditCard className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
              Abonnemang
            </Link>
          </div>

          {/* Separator + Logga ut */}
          <div className="border-t border-[#1d3557]/[0.06] py-1.5">
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex items-center gap-2.5 px-4 py-2 w-full text-[13px] font-medium text-[#e63946] hover:bg-rose-50/60 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Logga ut
            </button>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger */}
      {showLabels ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full p-3 bg-white/[0.06] border border-white/[0.06] rounded-xl transition-colors duration-200 hover:bg-white/[0.1] cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#457b9d] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-white/40 truncate">
                {user.email}
              </p>
            </div>
            <span className="text-[10px] font-semibold text-[#a8dadc] bg-[#a8dadc]/10 px-2 py-0.5 rounded-md border border-[#a8dadc]/15 capitalize">
              {user.plan}
            </span>
          </div>
        </button>
      ) : (
        <div className="hidden md:flex justify-center">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-8 h-8 rounded-lg bg-[#457b9d] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-white/20 transition-all duration-200"
          >
            <span className="text-white font-semibold text-xs">{initials}</span>
          </button>
        </div>
      )}
    </div>
  );
}
