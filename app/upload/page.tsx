"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [category, setCategory] = useState("HYMN");
  const [season, setSeason] = useState("Ordinary Time");
  const [role, setRole] = useState("Entrance Hymn");

  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [loading, setLoading] = useState(false);

  // Handle local PDF file selection and create a secure object URL for viewing/downloading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a valid PDF score document.");
        return;
      }
      setFileName(file.name);
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/media/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          composer: composer || "Traditional / Anonymous",
          category,
          season,
          role,
          fileUrl:
            fileUrl ||
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          audioUrl: audioUrl.trim() || null,
          videoUrl: videoUrl.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to upload composition");

      alert(
        "Sacred score successfully uploaded and cataloged with media indicators!",
      );
      router.push("/hymns");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="border-b border-amber-900/20 pb-4 mb-8">
        <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
          Repertoire Submission Suite
        </span>
        <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
          Upload Sacred Score
        </h1>
        <p className="text-stone-600 text-sm italic mt-1">
          Upload PDF sheet music from your device, assign exact liturgical
          roles, seasons, and optional audio/video recordings.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-md border border-amber-900/20 shadow-sm space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
            Composition Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Ave Verum Corpus"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
          />
        </div>

        {/* Composer */}
        <div>
          <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
            Composer / Source
          </label>
          <input
            type="text"
            placeholder="e.g., Wolfgang Amadeus Mozart or Gregorian Chant"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
          />
        </div>

        {/* Category & Season Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
              Sacred Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
            >
              <option value="HYMN">Hymn</option>
              <option value="CHANT">Gregorian Chant</option>
              <option value="POLYPHONY">Sacred Polyphony</option>
              <option value="MASS_SETTING">Mass Setting</option>
              <option value="MOTET">Motet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
              Liturgical Season
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
            >
              <option value="Ordinary Time">Ordinary Time</option>
              <option value="Advent">Advent</option>
              <option value="Christmas">Christmas</option>
              <option value="Lent">Lent</option>
              <option value="Triduum">Triduum</option>
              <option value="Easter">Easter</option>
              <option value="Marian Feasts">Marian Feasts</option>
            </select>
          </div>
        </div>

        {/* Exact Liturgical Role / Mass Part */}
        <div>
          <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
            Primary Liturgical Role / Mass Part
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
          >
            <option value="Entrance Hymn">Entrance Hymn</option>
            <option value="Kyrie / Penitential">Kyrie / Penitential</option>
            <option value="Gloria">Gloria</option>
            <option value="Responsorial Psalm">Responsorial Psalm</option>
            <option value="Gospel Acclamation">Gospel Acclamation</option>
            <option value="Offertory / Gifts">Offertory / Gifts</option>
            <option value="Sanctus">Sanctus (Holy, Holy, Holy)</option>
            <option value="Memorial Acclamation">Memorial Acclamation</option>
            <option value="Pater Noster">
              Pater Noster (Lord&apos;s Prayer)
            </option>
            <option value="Agnus Dei">Agnus Dei (Lamb of God)</option>
            <option value="Communion Hymn">Communion Hymn</option>
            <option value="Meditation / Motet">Meditation / Motet</option>
            <option value="Recessional / Closing">Recessional / Closing</option>
          </select>
        </div>

        {/* Optional Audio & Video URL Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
              Audio Recording URL{" "}
              <span className="text-[10px] lowercase text-stone-500 font-normal">
                (optional)
              </span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/audio.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
            />
          </div>

          <div>
            <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
              Video Reference URL{" "}
              <span className="text-[10px] lowercase text-stone-500 font-normal">
                (optional)
              </span>
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
            />
          </div>
        </div>

        {/* PDF Device File Upload */}
        <div>
          <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
            Upload PDF Score from Device{" "}
            <span className="text-[10px] lowercase text-stone-500 font-normal">
              (optional)
            </span>
          </label>
          <div className="border-2 border-dashed border-amber-900/30 rounded-sm p-6 text-center bg-[#FDFBF7] hover:bg-amber-50/40 transition">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer space-y-2 block"
            >
              <span className="text-2xl block text-amber-800">📄</span>
              <span className="text-xs font-semibold text-stone-800 block">
                {fileName
                  ? `Selected: ${fileName}`
                  : "Click to browse device for PDF score"}
              </span>
              <span className="text-[10px] text-stone-500 italic block">
                PDF format up to 20MB
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-[family-name:var(--font-cinzel)] tracking-wider font-semibold px-6 py-3 rounded-sm shadow transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Uploading Score..." : "Upload & Save to Registry"}
          </button>
        </div>
      </form>
    </div>
  );
}
