"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Hymnary", href: "/hymns" },
    { name: "Liturgical Planner", href: "/planner" },
    { name: "Upload Score", href: "/upload" },
    { name: "Admin Panel", href: "/admin" },
    { name: "AI Generator", href: "/generate" },
  ];

  return (
    <header className="bg-[#FDFBF7] text-stone-900 border-b border-amber-900/20 sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-28">
        {/* Enriched Logo Only */}
        <Link href="/" className="flex items-center group py-2">
          <img
            src="/logo.png"
            alt="MuseNote Logo"
            className="h-18 sm:h-20 w-auto max-w-[220px] object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 font-[family-name:var(--font-cinzel)] text-xs tracking-wide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-sm transition-all ${
                  isActive
                    ? "bg-amber-900 text-amber-50 shadow-xs font-semibold"
                    : "text-stone-700 hover:text-amber-950 hover:bg-amber-900/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/upload"
            className="bg-amber-900 hover:bg-amber-800 active:scale-95 text-amber-50 font-[family-name:var(--font-cinzel)] text-xs tracking-wider px-4 py-2.5 rounded-sm shadow-xs transition flex items-center gap-2 font-semibold"
          >
            <span className="text-amber-200 font-bold text-sm">+</span>
            <span>Upload Score</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-stone-800 hover:text-amber-900 p-2 rounded focus:outline-hidden cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mounted && mobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-t border-amber-900/20 px-4 pt-3 pb-6 space-y-2 font-[family-name:var(--font-cinzel)] shadow-xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded text-xs tracking-wider transition-all ${
                  isActive
                    ? "bg-amber-900 text-amber-50 font-semibold"
                    : "text-stone-700 hover:text-amber-950 hover:bg-amber-900/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-amber-900/20">
            <Link
              href="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-amber-900 text-amber-50 text-center py-3 rounded text-xs font-[family-name:var(--font-cinzel)] tracking-wider shadow-xs block font-semibold"
            >
              + Upload Score Composition
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const [year, setYear] = useState<number>(2026);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-[#F5EFEB] text-stone-700 border-t border-amber-900/20 mt-auto font-[family-name:var(--font-garamond)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="MuseNote Logo"
                className="h-12 w-auto object-contain"
              />
              <span className="font-[family-name:var(--font-cinzel)] font-bold text-lg text-amber-950 tracking-wide">
                MuseNote
              </span>
            </div>
            <p className="text-xs italic max-w-sm leading-relaxed text-stone-600">
              A classic sacred liturgical music planning and repository platform
              preserving the rich heritage of sacred chant, polyphony, and
              timeless hymnody.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-amber-900 font-bold mb-3 font-[family-name:var(--font-cinzel)]">
              Sacred Treasury
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/hymns" className="hover:text-amber-950 transition">
                  Hymnary Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/planner"
                  className="hover:text-amber-950 transition"
                >
                  Liturgical Planner
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="hover:text-amber-950 transition"
                >
                  Composer Upload
                </Link>
              </li>
              <li>
                <Link
                  href="/generate"
                  className="hover:text-amber-950 transition text-amber-900 font-semibold"
                >
                  AI Music Generator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-amber-900 font-bold mb-3 font-[family-name:var(--font-cinzel)]">
              Administration
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-amber-950 transition">
                  Moderation Panel
                </Link>
              </li>
              <li>
                <span className="text-stone-500 italic">Sacred Rites v1.0</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-amber-900/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {mounted ? year : "2026"} MuseNote. All rights reserved.</p>
          <div className="flex items-center gap-2 bg-[#EFECE6] px-3 py-1.5 rounded-sm border border-amber-950/10">
            <span className="text-amber-900 font-bold">☩</span>
            <span className="italic text-stone-800">
              Crafted & Designed by Moti
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
