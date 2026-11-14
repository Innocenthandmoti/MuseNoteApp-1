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
  audioUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
}

export default function HymnsCatalogPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");

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

  // Extract unique options from loaded songs so dropdowns always match your database
  const categories = [
    "All",
    ...Array.from(
      new Set(songs.map((s) => s.category || "Mass / Sunday Liturgy")),
    ),
  ];
  const seasons = [
    "All",
    ...Array.from(new Set(songs.map((s) => s.season || "Ordinary Time"))),
  ];
  const roles = [
    "All",
    ...Array.from(new Set(songs.map((s) => s.role || "General"))),
  ];

  // Filter songs based on search query + Category, Season, and Role dropdowns
  const filteredSongs = songs.filter((song) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      song.title?.toLowerCase().includes(query) ||
      song.composer?.toLowerCase().includes(query) ||
      song.season?.toLowerCase().includes(query) ||
      song.category?.toLowerCase().includes(query) ||
      song.role?.toLowerCase().includes(query);

    const songCategory = song.category || "Mass / Sunday Liturgy";
    const songSeason = song.season || "Ordinary Time";
    const songRole = song.role || "General";

    const matchesCategory =
      selectedCategory === "All" || songCategory === selectedCategory;
    const matchesSeason =
      selectedSeason === "All" || songSeason === selectedSeason;
    const matchesRole = selectedRole === "All" || songRole === selectedRole;

    return matchesSearch && matchesCategory && matchesSeason && matchesRole;
  });

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "All" ||
    selectedSeason !== "All" ||
    selectedRole !== "All";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedSeason("All");
    setSelectedRole("All");
  };

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

        {/* Search & Liturgical Metadata Filters */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
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
                    strokeWidth="2"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search title or composer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded px-4 py-2.5 pl-10 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-900 focus:border-amber-900 font-sans"
              />
            </div>

            {/* Category / Occasion Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
              className="w-full bg-white border border-stone-300 rounded px-3 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900 focus:border-amber-900 font-sans cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories / Occasions" : cat}
                </option>
              ))}
            </select>

            {/* Liturgical Season Filter */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              aria-label="Filter by Season"
              className="w-full bg-white border border-stone-300 rounded px-3 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900 focus:border-amber-900 font-sans cursor-pointer"
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season === "All" ? "All Liturgical Seasons" : season}
                </option>
              ))}
            </select>

            {/* Liturgical Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              aria-label="Filter by Role"
              className="w-full bg-white border border-stone-300 rounded px-3 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900 focus:border-amber-900 font-sans cursor-pointer"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "All" ? "All Liturgical Roles" : role}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-between items-center text-xs text-stone-500 px-1">
              <span>Showing {filteredSongs.length} matching score(s)</span>
              <button
                onClick={resetFilters}
                className="text-amber-900 hover:underline font-semibold cursor-pointer"
              >
                Reset All Filters
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
                className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md hover:border-amber-900/40 transition cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                {/* Card Header & Metadata Badges */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-sm border border-amber-200/60 uppercase">
                      {song.category || "Mass / Sunday Liturgy"}
                    </span>
                    <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-sm border border-stone-200 uppercase">
                      {song.season || "Ordinary Time"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900 group-hover:text-amber-900 transition leading-snug">
                      {song.title}
                    </h3>
                    <p className="text-xs italic text-stone-600 font-[family-name:var(--font-cinzel)] mt-0.5">
                      By{" "}
                      <span className="font-semibold text-stone-800">
                        {song.composer || "Unknown Composer"}
                      </span>
                    </p>
                  </div>

                  {/* 📄 PDF First Page Preview Frame */}
                  {song.fileUrl ? (
                    <div className="w-full h-40 bg-stone-50 rounded-lg overflow-hidden border border-stone-200/80 relative group/preview">
                      <iframe
                        src={`${song.fileUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        title={`${song.title} - Page 1`}
                        className="w-full h-full pointer-events-none opacity-90 group-hover/preview:opacity-100 transition"
                      />
                      <div className="absolute inset-0 bg-transparent group-hover/preview:bg-black/5 transition flex items-end p-2">
                        <span className="text-[9px] font-[family-name:var(--font-cinzel)] font-bold uppercase bg-white/95 text-stone-800 px-2 py-0.5 rounded shadow-xs border border-stone-200">
                          Sheet Music Preview
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-stone-50 rounded-lg flex items-center justify-center text-xs text-stone-400 italic border border-stone-200/80">
                      No sheet music preview
                    </div>
                  )}
                </div>

                {/* Card Footer Actions & Media Links */}
                <div className="pt-3 border-t border-stone-100 space-y-3">
                  {/* Quick Audio & Video Buttons (If available) */}
                  {(song.audioUrl || song.videoUrl) && (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {song.audioUrl && (
                        <a
                          href={song.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-center py-1.5 px-2 rounded-md text-[11px] font-[family-name:var(--font-cinzel)] font-bold transition flex items-center justify-center gap-1"
                        >
                          <span>🎵</span> Audio
                        </a>
                      )}
                      {song.videoUrl && (
                        <a
                          href={song.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-center py-1.5 px-2 rounded-md text-[11px] font-[family-name:var(--font-cinzel)] font-bold transition flex items-center justify-center gap-1"
                        >
                          <span>🎬</span> Video
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs font-[family-name:var(--font-cinzel)] text-amber-900 font-bold pt-1">
                    <span className="group-hover:underline">
                      Inspect Full Score & Lyrics
                    </span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
