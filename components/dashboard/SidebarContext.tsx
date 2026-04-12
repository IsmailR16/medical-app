"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarCtx = createContext<SidebarContextValue | null>(null);

export function useSidebarCtx() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebarCtx must be used within DashboardShell");
  return ctx;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <SidebarCtx.Provider value={{ mobileOpen, setMobileOpen, collapsed, toggleCollapsed }}>
      <div className="flex min-h-[100dvh] bg-[#F9FAFB]">
        {children}
      </div>
    </SidebarCtx.Provider>
  );
}

/** Wrapper for the main content area that offsets by sidebar width */
export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarCtx();
  const desktopMargin = collapsed ? "md:ml-[72px]" : "md:ml-[260px]";

  return (
    <div
      className={`flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ml-0 ${desktopMargin}`}
    >
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
