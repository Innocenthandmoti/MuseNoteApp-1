"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MediaItem {
  id: string;
  title: string;
  composer: string | null;
  category: string;
  fileUrl: string | null;
}

export default function HomePage() {
  const [catalog, setCatalog] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const sampleItems: MediaItem[] = [
    {
      id: "1",
      title: "Panis Angelicus",
      composer: "César Franck",
      category: "HYMN",
      fileUrl: "#",
    },
    {
      id: "2",
      title: "Pater Noster (Chant)",
      composer: "Gregorian Chant",
      category: "MASS_SETTING",
      fileUrl: "#",
    },
    {
      id: "3",
      title: "Veni, Veni, Emmanuel",
      composer: "Traditional",
      category: "HYMN",
      fileUrl: "#",
    },
  ];

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch("/api/media/catalog");
        if (res.ok) {
          const data = await res.json();
          setCatalog(
            Array.isArray(data) && data.length > 0 ? data : sampleItems,
          );
        } else {
          setCatalog(sampleItems);
        }
      } catch {
        setCatalog(sampleItems);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-amber-50 rounded-xl p-8 sm:p-14 shadow-xl border border-amber-900/30 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 text-[12rem] font-[family-name:var(--font-cinzel)] translate-x-12 translate-y-12 select-none pointer-events-none leading-none">
          ☩
        </div>
        <div className="max-w-2xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 bg-amber-900/80 text-amber-200 px-3.5 py-1 rounded-sm text-xs font-[family-name:var(--font-cinzel)] tracking-widest uppercase border border-amber-700/50 font-semibold">
            <span>☩</span>
            <span>Sacred Liturgical Repertoire</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-cinzel)] font-bold tracking-tight leading-[1.15] text-amber-100">
            Preserving the Heritage of Church Music
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed italic">
            Plan solemn Masses, curate pristine choral repertoires, upload
            authorized PDF scores, and access centuries of Gregorian chant,
            polyphony, and sacred hymnody.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/planner"
              className="bg-amber-800 hover:bg-amber-700 active:scale-95 text-amber-50 font-[family-name:var(--font-cinzel)] text-xs tracking-wider px-6 py-3 rounded-sm shadow transition border border-amber-600/50 font-semibold"
            >
              Open Liturgical Planner
            </Link>
            <Link
              href="/hymns"
              className="bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 font-[family-name:var(--font-cinzel)] text-xs tracking-wider px-6 py-3 rounded-sm shadow transition border border-stone-700 font-semibold"
            >
              Browse Hymnary Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Showcase Section */}
      <section className="space-y-6">
        <div className="border-b border-amber-900/20 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-widest text-amber-900 font-bold">
                Treasury Showcase
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
              Featured Sacred Compositions
            </h2>
          </div>
          <Link
            href="/hymns"
            className="text-xs font-[family-name:var(--font-cinzel)] tracking-wider text-amber-900 hover:text-amber-950 font-bold underline underline-offset-4"
          >
            View Full Catalog →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {catalog.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-md border border-amber-900/20 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-800"></div>
                <div>
                  <span className="text-[10px] font-[family-name:var(--font-cinzel)] tracking-widest uppercase text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xs border border-amber-200/60 font-semibold">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-3 group-hover:text-amber-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm italic text-stone-600 mt-1">
                    {item.composer || "Traditional / Chant"}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setActiveMedia(item)}
                    className="w-full text-xs font-[family-name:var(--font-cinzel)] tracking-wider bg-stone-900 text-amber-50 hover:bg-amber-950 active:scale-95 py-3 rounded-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer font-semibold"
                  >
                    <span>Inspect Score PDF</span>
                    <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Score Inspection Modal */}
      {activeMedia && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FDFBF7] rounded-lg border border-amber-900/40 max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 text-xl font-serif cursor-pointer"
              aria-label="Close Modal"
            >
              ✕
            </button>
            <div className="text-center py-4 space-y-3">
              <span className="text-4xl block text-amber-800 font-[family-name:var(--font-cinzel)]">
                ☩
              </span>
              <h3 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
                {activeMedia.title}
              </h3>
              <p className="text-sm italic text-stone-600">
                {activeMedia.composer}
              </p>
              <div className="pt-4">
                <a
                  href={activeMedia.fileUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-900 text-amber-50 hover:bg-amber-950 px-6 py-3 rounded-sm text-xs font-[family-name:var(--font-cinzel)] tracking-wider shadow inline-block transition active:scale-95 font-semibold"
                >
                  Download / View PDF Score
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
