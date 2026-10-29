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
  fileUrl?: string;
}

export default function HymnsPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchApprovedSongs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("MediaItem")
        .select("*")
        .eq("isApproved", true)
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching hymns:", error);
      } else {
        setSongs(data || []);
      }
      setLoading(false);
    };

    fetchApprovedSongs();
  }, []);

  // Filter songs based on search query
  const filteredSongs = songs.filter((song) => {
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
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-900/15 pb-6">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold uppercase tracking-widest text-amber-900 bg-amber-50 px-3 py-1 rounded border border-amber-200">
              Public Repertoire
            </span>
            <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              Sacred Hymnary Catalog
            </h1>
            <p className="text-xs italic text-stone-600 mt-1 font-[family-name:var(--font-cinzel)]">
              Explore approved sacred compositions, view liturgical settings,
              and inspect scores.
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer self-start md:self-auto"
          >
            ← Return to Home
          </button>
        </div>

        {/* Clean Neutral Search Input Bar with Custom Vector Icon */}
        <div>
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
              className="w-full bg-white border border-stone-300 rounded px-4 py-2.5 pl-10 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-700 focus:border-stone-700 font-sans"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 flex justify-between items-center text-xs text-stone-500 px-1">
              <span>Found {filteredSongs.length} matching score(s)</span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-stone-700 hover:underline font-semibold cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
            <p className="italic text-stone-500 text-sm">
              {searchQuery
                ? "No hymns match your search criteria."
                : "No approved hymns available in the catalog yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="bg-white rounded-lg border border-amber-900/20 p-6 shadow-xs hover:shadow-md hover:border-amber-800/40 transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      {song.season || "Ordinary Time"}
                    </span>
                    {song.keySignature && (
                      <span className="text-[10px] font-mono text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60">
                        {song.keySignature}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900 group-hover:text-amber-900 transition">
                    {song.title}
                  </h3>

                  <p className="text-xs italic text-stone-600 font-[family-name:var(--font-cinzel)]">
                    Composer:{" "}
                    <span className="font-semibold text-stone-800">
                      {song.composer || "Unknown"}
                    </span>
                  </p>

                  {song.role && (
                    <p className="text-[11px] text-stone-500 font-medium">
                      Role: {song.role}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/hymns/${song.id}`)}
                    className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs px-4 py-2 rounded font-[family-name:var(--font-cinzel)] font-semibold transition cursor-pointer"
                  >
                    See More / Details →
                  </button>
                  {song.fileUrl && (
                    <a
                      href={song.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-800 hover:underline font-medium"
                    >
                      PDF ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
