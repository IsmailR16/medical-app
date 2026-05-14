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

  // Scroll to top on route change. Next.js's default scroll-to-top can miss
  // when the destination page has heavy motion animations or staggered
  // hydration (e.g. /evaluations with multiple FadeUp wrappers + CategoryBars
  // recharts mount) — the framework's scroll fires before the page settles
  // and then layout shifts push the scroll position back down.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
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
      {/* No overflow-auto here on purpose: a nested scroll container
          would trap navigation scroll-to-top (Next.js scrolls window,
          not arbitrary descendants). Sidebar is `fixed` so body-level
          scrolling is fine. */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
