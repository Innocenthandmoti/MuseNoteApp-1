"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [role, setRole] = useState("Entrance");
  const [season, setSeason] = useState("Ordinary Time");

  const [lyrics, setLyrics] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUser(session.user);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    if (!title) {
      setTitle(uploadedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSaveToCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      alert("Please provide a PDF file and a song title.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload PDF file to Supabase Storage bucket ('scores')
      const fileName = `${Date.now()}_${file.name}`;
      const { error: storageError } = await supabase.storage
        .from("scores")
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage
        .from("scores")
        .getPublicUrl(fileName);

      // 2. Insert metadata & lyrics into 'MediaItem' table
      const { error: dbError } = await supabase.from("MediaItem").insert({
        title,
        composer,
        role,
        season,
        lyrics,
        audioUrl: audioUrl || null,
        videoUrl: videoUrl || null,
        fileUrl: publicUrlData.publicUrl,
        user_id: currentUser?.id || null,
        isApproved: false,
      });

      if (dbError) throw dbError;

      alert("🎉 Song uploaded and saved successfully!");
      setTitle("");
      setComposer("");
      setLyrics("");
      setAudioUrl("");
      setVideoUrl("");
      setFile(null);
      router.push("/hymns");
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-12">
        Loading upload portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-2xl mx-auto space-y-6 bg-white rounded-xl border border-amber-900/20 p-8 shadow-xs">
        <div className="border-b border-amber-900/10 pb-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Music Repository
            </span>
            <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              Upload Sacred Score
            </h1>
          </div>
          <button
            onClick={() => router.push("/hymns")}
            className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer"
          >
            ← Catalog
          </button>
        </div>

        <form onSubmit={handleSaveToCatalog} className="space-y-4">
          <div>
            <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-2">
              Select PDF Score File *
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full text-xs text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-900 file:text-amber-50 hover:file:bg-amber-950 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
              Song Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Panis Angelicus"
              className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Composer / Arranger
              </label>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="e.g., César Franck"
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Liturgical Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
              >
                <option value="Entrance">Entrance</option>
                <option value="Kyrie">Kyrie</option>
                <option value="Gloria">Gloria</option>
                <option value="Responsorial Psalm">Responsorial Psalm</option>
                <option value="Gospel Acclamation">Gospel Acclamation</option>
                <option value="Credo">Credo</option>
                <option value="Prayer of the Faithful">
                  Prayer of the Faithful
                </option>
                <option value="Offertory">Offertory</option>
                <option value="Sanctus">Sanctus</option>
                <option value="Pater Noster">Pater Noster (Our Father)</option>
                <option value="Agnus Dei">Agnus Dei</option>
                <option value="Communion">Communion</option>
                <option value="Thanksgiving">Thanksgiving</option>
                <option value="Recessional">Recessional</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Audio Link (Optional)
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Video Link (Optional)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
              Song Lyrics (Manual Input)
            </label>
            <textarea
              rows={8}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Type or paste lyrics here..."
              className="w-full bg-[#FDFBF7] border border-stone-300 rounded p-3 text-xs text-stone-900 font-mono leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-amber-900 hover:bg-amber-950 text-amber-50 font-bold py-3 rounded text-xs tracking-wide uppercase font-[family-name:var(--font-cinzel)] cursor-pointer disabled:opacity-50 transition shadow-xs"
          >
            {uploading
              ? "Uploading & Saving..."
              : "Save Song & Lyrics to Catalog"}
          </button>
        </form>
      </div>
    </div>
  );
}
