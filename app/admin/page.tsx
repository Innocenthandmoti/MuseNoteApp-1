"use client";

import { useEffect, useState } from "react";
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
  videoUrl?: string;
  isApproved: boolean;
  createdAt?: string;
}

export default function AdminPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  // Modals state
  const [selectedSong, setSelectedSong] = useState<Song | null>(null); // For viewing full details
  const [editingSong, setEditingSong] = useState<Song | null>(null); // For editing details

  // Fetch real songs from Supabase database
  const fetchSongs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("MediaItem")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching songs:", error);
    } else {
      setSongs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Approve song in Supabase
  const approveSong = async (id: string) => {
    try {
      const { error } = await supabase
        .from("MediaItem")
        .update({ isApproved: true })
        .eq("id", id);

      if (error) throw error;

      setSongs((prev) =>
        prev.map((song) =>
          song.id === id ? { ...song, isApproved: true } : song,
        ),
      );
      if (selectedSong?.id === id) {
        setSelectedSong({ ...selectedSong, isApproved: true });
      }
      alert("Score approved and published to the public catalog!");
    } catch (err: any) {
      alert(`Error approving score: ${err.message}`);
    }
  };

  // Delete or reject song from Supabase
  const deleteSong = async (id: string) => {
    if (
      confirm("Are you sure you want to delete or reject this composition?")
    ) {
      try {
        const { error } = await supabase
          .from("MediaItem")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setSongs((prev) => prev.filter((song) => song.id !== id));
        setSelectedSong(null);
        setEditingSong(null);
      } catch (err: any) {
        alert(`Error deleting score: ${err.message}`);
      }
    }
  };

  // Save edited details to Supabase
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    try {
      const { error } = await supabase
        .from("MediaItem")
        .update({
          title: editingSong.title,
          composer: editingSong.composer,
          category: editingSong.category,
          season: editingSong.season,
          role: editingSong.role,
          keySignature: editingSong.keySignature,
          lyrics: editingSong.lyrics,
        })
        .eq("id", editingSong.id);

      if (error) throw error;

      setSongs((prev) =>
        prev.map((song) => (song.id === editingSong.id ? editingSong : song)),
      );
      setEditingSong(null);
      alert("Changes saved successfully!");
    } catch (err: any) {
      alert(`Error updating score: ${err.message}`);
    }
  };

  const pendingSongs = songs.filter((s) => !s.isApproved);
  const approvedSongs = songs.filter((s) => s.isApproved);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-amber-200 flex flex-col">
      <main className="flex-1 max-w-6xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="border-b border-amber-900/15 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-widest text-amber-800 font-semibold">
                Administrative Control Panel
              </span>
            </div>
            <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
              Catalog Moderation & Verification
            </h1>
          </div>

          {/* Pending / Published Tabs */}
          <div className="flex gap-2 bg-stone-200/60 p-1 rounded-lg font-[family-name:var(--font-cinzel)] text-xs">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded transition cursor-pointer ${
                activeTab === "pending"
                  ? "bg-amber-900 text-amber-50 shadow-xs"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              Pending Review ({pendingSongs.length})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-4 py-2 rounded transition cursor-pointer ${
                activeTab === "approved"
                  ? "bg-amber-900 text-amber-50 shadow-xs"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              Published Catalog ({approvedSongs.length})
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
          </div>
        )}

        {/* Pending Review Section */}
        {!loading && activeTab === "pending" && (
          <div>
            {pendingSongs.length === 0 ? (
              <div className="bg-white border border-amber-900/15 rounded-lg p-12 text-center">
                <p className="font-[family-name:var(--font-cinzel)] italic text-stone-500">
                  No submissions currently awaiting moderation.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingSongs.map((song) => (
                  <div
                    key={song.id}
                    className="bg-white rounded-lg border border-amber-900/20 shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-[family-name:var(--font-cinzel)] italic text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Category: {song.category || "Hymn"}
                        </span>
                        <span className="text-[11px] font-[family-name:var(--font-cinzel)] text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                          Season: {song.season || "Ordinary Time"}
                        </span>
                        {song.role && (
                          <span className="text-[11px] font-[family-name:var(--font-cinzel)] text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                            Role: {song.role}
                          </span>
                        )}
                        {song.keySignature && (
                          <span className="text-[11px] font-mono text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200">
                            Key: {song.keySignature}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setSelectedSong(song)}
                        className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 hover:text-amber-900 cursor-pointer underline"
                      >
                        {song.title}
                      </h3>
                      <p className="text-xs font-[family-name:var(--font-cinzel)] italic text-stone-600">
                        Composer: {song.composer}
                      </p>

                      <div className="pt-2 flex items-center gap-4">
                        {song.fileUrl && (
                          <a
                            href={song.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-800 hover:underline font-semibold"
                          >
                            📄 View / Download PDF ↗
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedSong(song)}
                          className="text-xs text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                        >
                          🔍 View All Details
                        </button>
                      </div>

                      {song.lyrics && (
                        <p className="text-xs font-[family-name:var(--font-cinzel)] italic text-stone-500 bg-stone-50 p-3 rounded border border-stone-200 line-clamp-2 mt-2">
                          &quot;{song.lyrics}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
                      <button
                        onClick={() => approveSong(song.id)}
                        className="bg-amber-900 hover:bg-amber-950 active:scale-95 text-amber-50 font-[family-name:var(--font-cinzel)] text-xs px-4 py-2 rounded shadow transition cursor-pointer"
                      >
                        ✓ Approve & Publish
                      </button>
                      <button
                        onClick={() => setEditingSong(song)}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 active:scale-95 font-[family-name:var(--font-cinzel)] text-xs px-4 py-2 rounded transition cursor-pointer"
                      >
                        ✎ Edit Details
                      </button>
                      <button
                        onClick={() => deleteSong(song.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 active:scale-95 font-[family-name:var(--font-cinzel)] text-xs px-4 py-2 rounded transition cursor-pointer"
                      >
                        ✕ Reject / Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Published Catalog Section */}
        {!loading && activeTab === "approved" && (
          <div className="bg-white border border-amber-900/15 rounded-lg overflow-hidden shadow-sm">
            {approvedSongs.length === 0 ? (
              <div className="p-12 text-center font-[family-name:var(--font-cinzel)] italic text-stone-500">
                No approved hymns in the public catalog yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-amber-100 font-[family-name:var(--font-cinzel)] text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-normal">Title</th>
                    <th className="py-3.5 px-4 font-normal">Composer</th>
                    <th className="py-3.5 px-4 font-normal">Category</th>
                    <th className="py-3.5 px-4 font-normal">Season</th>
                    <th className="py-3.5 px-4 font-normal">PDF</th>
                    <th className="py-3.5 px-4 font-normal text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-[family-name:var(--font-cinzel)] text-sm">
                  {approvedSongs.map((song) => (
                    <tr
                      key={song.id}
                      className="hover:bg-amber-50/30 transition"
                    >
                      <td
                        onClick={() => setSelectedSong(song)}
                        className="py-3.5 px-4 font-bold text-stone-900 cursor-pointer hover:underline"
                      >
                        {song.title}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 italic">
                        {song.composer}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-700">
                        {song.category || "Hymn"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-amber-900">
                        {song.season || "Ordinary Time"}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {song.fileUrl ? (
                          <a
                            href={song.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-800 underline hover:text-amber-950 font-medium"
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-stone-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3">
                        <button
                          onClick={() => setSelectedSong(song)}
                          className="text-xs text-stone-700 hover:text-stone-900 cursor-pointer underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setEditingSong(song)}
                          className="text-xs text-amber-900 hover:text-amber-950 font-[family-name:var(--font-cinzel)] cursor-pointer underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSong(song.id)}
                          className="text-xs text-rose-700 hover:text-rose-900 font-[family-name:var(--font-cinzel)] cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* VIEW FULL SCORE DETAILS MODAL */}
      {selectedSong && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FDFBF7] rounded-lg border border-amber-900/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase tracking-wider">
                  {selectedSong.category || "Hymn"}
                </span>
                <h2 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-1">
                  {selectedSong.title}
                </h2>
                <p className="text-xs italic text-stone-600">
                  Composer: {selectedSong.composer || "Unknown"}
                </p>
              </div>
              <button
                onClick={() => setSelectedSong(null)}
                className="text-stone-400 hover:text-stone-800 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Comprehensive Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-amber-50/60 p-4 rounded border border-amber-200/70">
              <div>
                <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                  Category:
                </span>
                <span className="text-stone-900 font-medium">
                  {selectedSong.category || "Hymn"}
                </span>
              </div>
              <div>
                <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                  Season:
                </span>
                <span className="text-stone-900 font-medium">
                  {selectedSong.season || "Ordinary Time"}
                </span>
              </div>
              <div>
                <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                  Liturgical Role:
                </span>
                <span className="text-stone-900 font-medium">
                  {selectedSong.role || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                  Key Signature:
                </span>
                <span className="text-stone-900 font-mono font-medium">
                  {selectedSong.keySignature || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                  Moderation Status:
                </span>
                <span
                  className={
                    selectedSong.isApproved
                      ? "text-emerald-700 font-bold"
                      : "text-amber-800 font-bold"
                  }
                >
                  {selectedSong.isApproved
                    ? "Approved / Published"
                    : "Pending Approval"}
                </span>
              </div>
            </div>

            {/* Lyrics Section */}
            {selectedSong.lyrics ? (
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-[family-name:var(--font-cinzel)]">
                  Lyrics & Stanzas:
                </h4>
                <div className="bg-white p-4 rounded border border-stone-200 text-xs whitespace-pre-wrap italic font-[family-name:var(--font-cinzel)] text-stone-700 max-h-48 overflow-y-auto shadow-inner">
                  {selectedSong.lyrics}
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-400 italic bg-stone-50 p-3 rounded border border-stone-200">
                No lyrics or stanzas provided for this composition.
              </div>
            )}

            {/* PDF Document Link */}
            {selectedSong.fileUrl ? (
              <div className="pt-2">
                <a
                  href={selectedSong.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-900 text-amber-50 text-xs px-5 py-2.5 rounded shadow hover:bg-amber-950 transition font-semibold font-[family-name:var(--font-cinzel)]"
                >
                  📄 Download / View PDF Score Document ↗
                </a>
              </div>
            ) : (
              <div className="text-xs text-rose-600 italic">
                No attached PDF file found for this record.
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
              <button
                onClick={() => {
                  setEditingSong(selectedSong);
                  setSelectedSong(null);
                }}
                className="text-xs text-amber-900 hover:underline font-bold cursor-pointer font-[family-name:var(--font-cinzel)]"
              >
                ✎ Edit Full Details
              </button>
              <button
                onClick={() => setSelectedSong(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs rounded font-semibold cursor-pointer font-[family-name:var(--font-cinzel)]"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COMPOSITION MODAL */}
      {editingSong && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FDFBF7] rounded-lg border border-amber-900/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-4">
              <h3 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
                Edit Sacred Composition
              </h3>
              <button
                onClick={() => setEditingSong(null)}
                className="text-stone-400 hover:text-stone-800 text-lg font-serif cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                    Song Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSong.title}
                    onChange={(e) =>
                      setEditingSong({ ...editingSong, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] focus:outline-hidden focus:border-amber-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                    Composer
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSong.composer}
                    onChange={(e) =>
                      setEditingSong({
                        ...editingSong,
                        composer: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] focus:outline-hidden focus:border-amber-800 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingSong.category || ""}
                    onChange={(e) =>
                      setEditingSong({
                        ...editingSong,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] bg-white focus:outline-hidden focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                    Season
                  </label>
                  <select
                    value={editingSong.season || "Ordinary Time"}
                    onChange={(e) =>
                      setEditingSong({ ...editingSong, season: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] bg-white focus:outline-hidden focus:border-amber-800"
                  >
                    <option value="Advent">Advent</option>
                    <option value="Christmas">Christmas</option>
                    <option value="Lent">Lent</option>
                    <option value="Triduum">Triduum</option>
                    <option value="Easter">Easter</option>
                    <option value="Ordinary Time">Ordinary Time</option>
                    <option value="Marian Feasts">Marian Feasts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                    Liturgical Role
                  </label>
                  <input
                    type="text"
                    value={editingSong.role || ""}
                    onChange={(e) =>
                      setEditingSong({ ...editingSong, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] bg-white focus:outline-hidden focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                  Key Signature
                </label>
                <input
                  type="text"
                  value={editingSong.keySignature || ""}
                  onChange={(e) =>
                    setEditingSong({
                      ...editingSong,
                      keySignature: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] focus:outline-hidden focus:border-amber-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                  Lyrics & Stanzas
                </label>
                <textarea
                  rows={4}
                  value={editingSong.lyrics || ""}
                  onChange={(e) =>
                    setEditingSong({ ...editingSong, lyrics: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] focus:outline-hidden focus:border-amber-800 bg-white"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSong(null)}
                  className="px-4 py-2 text-xs font-[family-name:var(--font-cinzel)] text-stone-600 hover:bg-stone-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-[family-name:var(--font-cinzel)] bg-amber-900 text-amber-50 hover:bg-amber-950 rounded shadow cursor-pointer active:scale-95 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
