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
  audioUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
}

export default function HymnsCatalogPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchApprovedScores = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("MediaItem")
        .select("*")
        .eq("isApproved", true)
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching catalog items:", error);
      } else {
        setSongs(data || []);
      }
      setLoading(false);
    };

    fetchApprovedScores();
  }, []);

  // Filter songs based on search query
  const filteredSongs = songs.filter((song) => {
    const query = searchQuery.toLowerCase();
    return (
      song.title?.toLowerCase().includes(query) ||
      song.composer?.toLowerCase().includes(query) ||
      song.season?.toLowerCase().includes(query) ||
      song.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-amber-900/20 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Sacred Repertoire Repository
            </span>
            <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              Public Hymnary & Score Catalog
            </h1>
            <p className="text-stone-600 text-sm italic mt-1 font-[family-name:var(--font-cinzel)]">
              Browse approved compositions, listen to preview audio, or inspect
              score sheet music.
            </p>
          </div>

          <button
            onClick={() => router.push("/upload")}
            className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs px-5 py-2.5 rounded font-[family-name:var(--font-cinzel)] font-semibold transition shadow-xs cursor-pointer"
          >
            + Submit New Score
          </button>
        </div>

        {/* Clean Neutral Search Input Bar */}
        <div className="max-w-xl">
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
              placeholder="Search by hymn title, composer, or season..."
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
          <div className="bg-white border border-stone-200 rounded-lg p-12 text-center text-stone-500 italic">
            No approved compositions match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => router.push(`/hymns/${song.id}`)}
                className="bg-white rounded-lg border border-amber-900/20 p-6 shadow-xs hover:shadow-md hover:border-amber-800/40 transition cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded border border-amber-200">
                      {song.category || "HYMN"}
                    </span>
                    <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      {song.season || "Ordinary Time"}
                    </span>
                  </div>

                  <h3 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900 group-hover:text-amber-900 transition leading-snug">
                    {song.title}
                  </h3>

                  <p className="text-xs italic text-stone-600 font-[family-name:var(--font-cinzel)]">
                    By{" "}
                    <span className="font-semibold text-stone-800">
                      {song.composer || "Unknown Composer"}
                    </span>
                  </p>

                  {(song.audioUrl || song.videoUrl) && (
                    <div className="flex gap-2 text-[11px] text-amber-900 font-medium pt-1">
                      {song.audioUrl && <span>🎵 Audio</span>}
                      {song.videoUrl && <span>🎬 Video</span>}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs font-[family-name:var(--font-cinzel)] text-amber-900 font-bold">
                  <span>View Details & Score</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
