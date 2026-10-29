"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Song {
  id: string;
  title: string;
  composer: string;
  category?: string;
  season?: string;
  role?: string;
  keySignature?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [latestSongs, setLatestSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLatestScores = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("MediaItem")
        .select("*")
        .eq("isApproved", true)
        .order("id", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching latest scores:", error);
      } else {
        setLatestSongs(data || []);
      }
      setLoading(false);
    };

    fetchLatestScores();
  }, []);

  // Filter latest scores on homepage
  const filteredSongs = latestSongs.filter((song) => {
    const query = searchQuery.toLowerCase();
    return (
      song.title?.toLowerCase().includes(query) ||
      song.composer?.toLowerCase().includes(query) ||
      song.season?.toLowerCase().includes(query) ||
      song.role?.toLowerCase().includes(query) ||
      song.keySignature?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans flex flex-col justify-between selection:bg-amber-200">
      {/* Top Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-800 via-amber-600 to-amber-900" />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-16 space-y-12">
        {/* Sacred Hero Header Section */}
        <div className="relative text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-50/90 border border-amber-300/60 px-4 py-1.5 rounded-full shadow-xs">
            <span className="text-amber-800 text-xs">✨</span>
            <span className="text-[11px] font-[family-name:var(--font-cinzel)] font-semibold uppercase tracking-widest text-amber-900">
              Sacred Repertoire & Liturgical Music
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 tracking-tight leading-tight">
            Preserving Sacred Scores & Choral Tradition
          </h1>

          <p className="text-stone-600 text-sm sm:text-base italic max-w-xl mx-auto font-[family-name:var(--font-cinzel)] leading-relaxed">
            Discover traditional hymns, chants, and polyphonic settings. Inspect
            detailed liturgical settings, lyrics, and download scores.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push("/hymns")}
              className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs sm:text-sm px-6 py-3 rounded-md font-[family-name:var(--font-cinzel)] font-bold transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Explore Full Hymnary →
            </button>
            <button
              onClick={() => router.push("/upload")}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs sm:text-sm px-6 py-3 rounded-md font-[family-name:var(--font-cinzel)] font-semibold transition cursor-pointer"
            >
              Submit a Score
            </button>
          </div>
        </div>

        {/* Home Page Search Bar (Clean Charcoal Vector Icon) */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-700">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by hymn title, composer, season, or key signature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg px-4 py-3 pl-10 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-700 focus:border-stone-700 font-sans shadow-xs"
            />
          </div>
        </div>

        {/* Featured / Latest Scores Section */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-amber-900/15 pb-4 gap-2">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block font-[family-name:var(--font-cinzel)]">
                Recent Submissions
              </span>
              <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
                Recently Added Compositions
              </h2>
            </div>
            <button
              onClick={() => router.push("/hymns")}
              className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:text-amber-950 hover:underline font-bold cursor-pointer"
            >
              View Complete Catalog →
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center shadow-xs">
              <p className="font-[family-name:var(--font-cinzel)] italic text-stone-500 text-sm">
                {searchQuery
                  ? "No recent compositions match your search."
                  : "No approved compositions published yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => router.push(`/hymns/${song.id}`)}
                  className="bg-white rounded-xl border border-amber-900/20 p-6 shadow-xs hover:shadow-xl hover:border-amber-800/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-900/10 group-hover:bg-amber-800 transition" />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200/80">
                        {song.season || "Ordinary Time"}
                      </span>
                      {song.keySignature && (
                        <span className="text-[10px] font-mono text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                          {song.keySignature}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 group-hover:text-amber-900 transition leading-snug">
                      {song.title}
                    </h3>

                    <p className="text-xs italic text-stone-600 font-[family-name:var(--font-cinzel)]">
                      By{" "}
                      <span className="font-semibold text-stone-800">
                        {song.composer || "Unknown Composer"}
                      </span>
                    </p>

                    {song.role && (
                      <p className="text-[11px] text-stone-500 font-medium bg-stone-50 p-2 rounded border border-stone-100">
                        Role: {song.role}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-[family-name:var(--font-cinzel)] font-bold text-amber-900 group-hover:translate-x-0.5 transition">
                    <span>Inspect Score & Details</span>
                    <span className="text-base">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Catalog Banner Call-to-Action */}
          <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-amber-50 rounded-2xl p-8 sm:p-10 shadow-lg text-center space-y-4">
            <h3 className="text-2xl sm:text-3xl font-[family-name:var(--font-cinzel)] font-bold tracking-wide">
              Looking for a Specific Hymn or Setting?
            </h3>
            <p className="text-xs sm:text-sm text-amber-200/90 max-w-lg mx-auto font-[family-name:var(--font-cinzel)] italic">
              Access the complete repertoire catalog to filter by liturgical
              season, category, key signature, or title.
            </p>
            <div>
              <button
                onClick={() => router.push("/hymns")}
                className="bg-amber-100 hover:bg-white text-amber-950 text-xs sm:text-sm px-6 py-3 rounded-md font-[family-name:var(--font-cinzel)] font-bold transition shadow cursor-pointer active:scale-95"
              >
                Browse Full Public Catalog →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-900/10 py-8 text-center text-xs text-stone-500 font-[family-name:var(--font-cinzel)] space-y-1">
        <p>
          &copy; {new Date().getFullYear()} MuseNote. Dedicated to sacred music
          & liturgical repertoire.
        </p>
      </footer>
    </div>
  );
}
