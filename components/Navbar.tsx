"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const MOBILE_BREAKPOINT = 768;
const SCROLL_THRESHOLD = 80;
const SCROLL_DELTA = 4;

export default function Navbar({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Nav scroll morph (pill effect) + smart hide on mobile
    let lastY = window.scrollY;
    let hidden = false;
    let navScrolled = false;

    // Apply initial state if page is already scrolled (e.g. reload)
    if (window.scrollY > SCROLL_THRESHOLD) {
      navScrolled = true;
      navRef.current?.classList.add("nav-scrolled");
    }

    function onScroll() {
      const currentY = window.scrollY;

      // Pill morph
      const shouldScroll = currentY > SCROLL_THRESHOLD;
      if (shouldScroll !== navScrolled) {
        navScrolled = shouldScroll;
        navRef.current?.classList.toggle("nav-scrolled", navScrolled);
      }

      // Smart hide on mobile
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        if (hidden) {
          hidden = false;
          headerRef.current?.style.removeProperty("transform");
        }
        lastY = currentY;
        return;
      }

      const delta = currentY - lastY;

      if (delta > SCROLL_DELTA && currentY > SCROLL_THRESHOLD && !hidden) {
        hidden = true;
        if (headerRef.current) {
          headerRef.current.style.transform = "translateY(-100%)";
        }
      } else if (delta < -SCROLL_DELTA && hidden) {
        hidden = false;
        if (headerRef.current) {
          headerRef.current.style.transform = "translateY(0)";
        }
      }

      lastY = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Focus trap + Escape key for mobile menu
  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
        hamburgerRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    // Move focus into menu on open
    const firstLink = menuRef.current?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    document.body.style.overflow = "";
  }

  function toggleMenu() {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? "hidden" : "";
  }

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 pt-5 header-slide"
      >
        <nav
          ref={navRef}
          id="mainNav"
          className="mx-auto flex items-center justify-between max-w-[1400px] w-full rounded-xl px-4 md:px-8 lg:px-16 py-3 border border-transparent bg-transparent shadow-none"
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Logo />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#funktioner"
              className="text-[13px] font-medium text-[#64748B] hover:text-[#1D3557] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Funktioner
            </a>
            <a
              href="#hur-det-fungerar"
              className="text-[13px] font-medium text-[#64748B] hover:text-[#1D3557] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Hur det fungerar
            </a>
            <a
              href="#priser"
              className="text-[13px] font-medium text-[#64748B] hover:text-[#1D3557] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Priser
            </a>
          </div>

          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="hidden md:inline-flex items-center gap-2 bg-[#1D3557] text-white text-[13px] font-semibold rounded-full pl-4 pr-1.5 py-1.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#1D3557] active:scale-[0.98] group"
            >
              <span>Dashboard</span>
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </span>
            </Link>
          ) : (
            <Link
              href="/sign-up"
              className="hidden md:inline-flex items-center gap-2 bg-[#1D3557] text-white text-[13px] font-semibold rounded-full pl-4 pr-1.5 py-1.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#1D3557] active:scale-[0.98] group"
            >
              <span>Kom igång</span>
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            className="md:hidden flex items-center justify-center ham-btn"
            aria-label="Meny"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMenu}
          >
            <div
              className={`ham-lines${menuOpen ? " ham-active" : ""}`}
            >
              <span className="ham-line" />
              <span className="ham-line" />
              <span className="ham-line" />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobilmeny"
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-30 bg-white/[0.97] flex items-center justify-center transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]${menuOpen ? " opacity-100" : " opacity-0 pointer-events-none"}`}
      >
        <nav
          className={`flex flex-col items-center gap-10${menuOpen ? " menu-open" : ""}`}
        >
          <a
            href="#funktioner"
            className="menu-link text-2xl font-semibold"
            onClick={closeMenu}
          >
            Funktioner
          </a>
          <a
            href="#hur-det-fungerar"
            className="menu-link text-2xl font-semibold"
            onClick={closeMenu}
          >
            Hur det fungerar
          </a>
          <a
            href="#priser"
            className="menu-link text-2xl font-semibold"
            onClick={closeMenu}
          >
            Priser
          </a>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="menu-link mt-4 inline-flex items-center gap-2 bg-[#1D3557] text-white rounded-full px-7 py-3.5 text-base font-semibold"
            onClick={closeMenu}
          >
            {isSignedIn ? "Dashboard" : "Kom igång"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </Link>
        </nav>
      </div>
    </>
  );
}