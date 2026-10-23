"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: string;
  title: string;
  composer: string | null;
  category: string;
  fileUrl: string | null;
  createdAt: string;
}

export default function HymnaryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch("/api/media/catalog");
        if (!res.ok) throw new Error("Failed to fetch hymns catalog");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.composer &&
        item.composer.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-amber-900/20 gap-4">
        <div>
          <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
            Sacred Treasury & Repertoire
          </span>
          <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2 tracking-tight">
            Hymnary Catalog
          </h1>
          <p className="text-stone-600 text-sm mt-1 italic">
            Explore timeless sacred chants, polyphony, mass settings, and
            traditional hymns.
          </p>
        </div>
        <a
          href="/upload"
          className="bg-amber-900 hover:bg-amber-950 text-amber-50 font-[family-name:var(--font-cinzel)] text-xs tracking-wider font-semibold px-5 py-3 rounded-sm shadow-xs transition active:scale-95 flex items-center gap-2"
        >
          <span className="text-amber-200 text-sm font-bold">+</span>
          <span>Upload New Score</span>
        </a>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-md border border-amber-900/20 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search by title or composer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["ALL", "HYMN", "CHANT", "POLYPHONY", "MASS_SETTING", "MOTET"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-[family-name:var(--font-cinzel)] tracking-wider px-3 py-1.5 rounded-sm transition font-semibold cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-900 text-amber-50 shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-amber-900/10 hover:text-amber-950"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm">
          Error loading catalog: {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-md border border-amber-900/20 shadow-xs p-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200/50 font-[family-name:var(--font-cinzel)] text-lg font-bold">
            ☩
          </div>
          <h3 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
            No sacred scores found
          </h3>
          <p className="text-stone-600 text-sm mt-1 max-w-sm mx-auto italic">
            Try adjusting your search query or upload a new score to populate
            the catalog.
          </p>
        </div>
      )}

      {/* Catalog Grid */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-md border border-amber-900/20 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-800"></div>
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-xs uppercase">
                    {item.category.replace("_", " ")}
                  </span>
                  <span className="text-xs font-medium text-stone-500 italic">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900 tracking-tight">
                  {item.title}
                </h2>

                <p className="text-xs italic text-stone-600 mt-1">
                  Composer: {item.composer || "Traditional / Anonymous"}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center">
                <span className="text-[11px] font-mono text-stone-500 uppercase">
                  PDF Score
                </span>
                <a
                  href={item.fileUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-[family-name:var(--font-cinzel)] tracking-wider bg-stone-900 text-amber-50 hover:bg-amber-950 px-3.5 py-2 rounded-sm transition font-semibold"
                >
                  View / Download Score
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
