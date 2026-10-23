"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-amber-900/40 mt-auto font-serif">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="MuseNote Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="font-bold text-lg text-amber-50 tracking-wide font-serif">
                MuseNote
              </span>
            </div>
            <p className="text-xs text-stone-400 italic max-w-sm leading-relaxed">
              A classic sacred liturgical music planning and repository platform
              preserving the rich heritage of sacred chant, polyphony, and
              timeless hymnody.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
              Sacred Treasury
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/hymns" className="hover:text-amber-200 transition">
                  Hymnary Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/planner"
                  className="hover:text-amber-200 transition"
                >
                  Liturgical Planner
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="hover:text-amber-200 transition"
                >
                  Composer Upload
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
              Administration
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-amber-200 transition">
                  Moderation Panel
                </Link>
              </li>
              <li>
                <span className="text-stone-500 italic">Sacred Rites v1.0</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Attribution */}
        <div className="pt-6 border-t border-amber-900/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-400">
          <p>© {year} MuseNote. All rights reserved.</p>
          <div className="flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded border border-amber-900/30 shadow-inner">
            <span className="text-amber-400">☩</span>
            <span className="italic text-stone-300">
              Crafted & Designed by Moti
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
