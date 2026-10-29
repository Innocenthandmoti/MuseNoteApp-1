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
  keySignature?: string;
  lyrics?: string;
  audioUrl?: string;
  fileUrl?: string;
}

export default function HymnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchHymnDetails = async () => {
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

    fetchHymnDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-stone-900">
        <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold mb-2">
          Hymn Not Found
        </h1>
        <p className="text-xs text-stone-600 mb-4">
          This composition may have been removed or does not exist.
        </p>
        <button
          onClick={() => router.push("/hymns")}
          className="bg-amber-900 text-amber-50 text-xs px-4 py-2 rounded font-[family-name:var(--font-cinzel)]"
        >
          ← Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/hymns")}
          className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          ← Return to Hymnary Catalog
        </button>

        {/* Main Header Card */}
        <div className="bg-white rounded-lg border border-amber-900/20 p-8 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold bg-amber-100 text-amber-900 px-2.5 py-1 rounded uppercase tracking-wider">
              {song.category || "Hymn"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              {song.title}
            </h1>
            <p className="text-sm italic text-stone-600 font-[family-name:var(--font-cinzel)] mt-1">
              Composer:{" "}
              <span className="font-semibold text-stone-800">
                {song.composer}
              </span>
            </p>
          </div>

          {/* Settings / Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-amber-50/60 p-4 rounded-lg border border-amber-200/70">
            <div>
              <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                Season:
              </span>
              <span className="text-stone-900 font-medium font-[family-name:var(--font-cinzel)]">
                {song.season || "Ordinary Time"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                Liturgical Role:
              </span>
              <span className="text-stone-900 font-medium font-[family-name:var(--font-cinzel)]">
                {song.role || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                Key Signature:
              </span>
              <span className="text-stone-900 font-mono font-bold">
                {song.keySignature || "N/A"}
              </span>
            </div>
          </div>

          {/* Audio Preview Player */}
          {song.audioUrl && (
            <div className="space-y-2 bg-stone-50 p-4 rounded-lg border border-stone-200">
              <span className="text-xs font-[family-name:var(--font-cinzel)] font-bold text-stone-700 block uppercase">
                Listen to Audio Recording:
              </span>
              <audio controls className="w-full h-10">
                <source src={song.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Lyrics & Stanzas */}
          {song.lyrics && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-[family-name:var(--font-cinzel)]">
                Lyrics & Stanzas:
              </h3>
              <div className="bg-[#FAF8F5] p-6 rounded-lg border border-stone-200 text-sm whitespace-pre-wrap italic font-[family-name:var(--font-cinzel)] text-stone-800 shadow-inner leading-relaxed">
                {song.lyrics}
              </div>
            </div>
          )}

          {/* PDF Download Button */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            {song.fileUrl ? (
              <a
                href={song.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-900 text-amber-50 text-xs sm:text-sm px-6 py-3 rounded shadow hover:bg-amber-950 transition font-semibold font-[family-name:var(--font-cinzel)]"
              >
                📄 Download / View Full PDF Score ↗
              </a>
            ) : (
              <span className="text-xs text-rose-600 italic">
                No PDF file attached to this record.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
