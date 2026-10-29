"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  lyrics?: string;
  fileUrl?: string;
}

export default function HymnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchSongDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("MediaItem")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching hymn details:", error);
      } else {
        setSong(data);
      }
      setLoading(false);
    };

    fetchSongDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto py-20 px-6 text-center font-sans">
        <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
          Composition Not Found
        </h1>
        <p className="text-xs text-stone-600 mt-2 mb-6">
          The requested sacred score could not be located or may have been
          removed.
        </p>
        <button
          onClick={() => router.push("/hymns")}
          className="bg-amber-900 text-amber-50 px-4 py-2 rounded text-xs font-[family-name:var(--font-cinzel)] font-semibold cursor-pointer"
        >
          ← Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => router.push("/hymns")}
          className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer"
        >
          ← Return to Hymnary Catalog
        </button>

        <div className="bg-white rounded-xl border border-amber-900/20 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-amber-900/15 pb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold bg-amber-50 text-amber-900 px-3 py-1 rounded border border-amber-200">
                {song.category || "HYMN"}
              </span>
              <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold bg-stone-100 text-stone-800 px-3 py-1 rounded border border-stone-200">
                {song.season || "Ordinary Time"}
              </span>
              {song.role && (
                <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-bold bg-amber-100/70 text-amber-950 px-3 py-1 rounded border border-amber-300/80">
                  Part of Mass: {song.role}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 leading-tight">
              {song.title}
            </h1>

            <p className="text-sm italic text-stone-600 font-[family-name:var(--font-cinzel)]">
              Composer / Source:{" "}
              <span className="font-semibold text-stone-800">
                {song.composer || "Unknown Composer"}
              </span>
            </p>
          </div>

          {/* Media Links */}
          {(song.audioUrl || song.videoUrl) && (
            <div className="bg-amber-50/50 border border-amber-900/15 rounded-lg p-6 space-y-4">
              <h3 className="text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-amber-900 font-bold">
                Audio & Video Performance Links
              </h3>
              <div className="flex flex-wrap gap-4">
                {song.audioUrl && (
                  <a
                    href={song.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs px-4 py-2.5 rounded font-semibold font-[family-name:var(--font-cinzel)] transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>🎵 Listen to Audio Performance ↗</span>
                  </a>
                )}
                {song.videoUrl && (
                  <a
                    href={song.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-stone-900 hover:bg-black text-stone-50 text-xs px-4 py-2.5 rounded font-semibold font-[family-name:var(--font-cinzel)] transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>🎬 Watch Video Performance ↗</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Lyrics / Stanzas */}
          {song.lyrics && (
            <div className="space-y-3">
              <h3 className="text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold">
                Lyrics & Stanzas
              </h3>
              <div className="bg-[#FDFBF7] border border-stone-200 rounded-lg p-6 font-serif whitespace-pre-wrap text-stone-800 text-sm leading-relaxed">
                {song.lyrics}
              </div>
            </div>
          )}

          {/* PDF Score Action */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-500 italic font-[family-name:var(--font-cinzel)]">
              Inspect or download the official sacred sheet music score.
            </p>
            {song.fileUrl ? (
              <a
                href={song.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs px-6 py-3 rounded font-[family-name:var(--font-cinzel)] font-bold transition text-center shadow-xs cursor-pointer"
              >
                📄 Download / View Full PDF Score ↗
              </a>
            ) : (
              <span className="text-xs text-stone-400 italic">
                No PDF score file attached.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
