"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Song {
  id: string;
  title: string;
  composer: string;
  season: string;
  role?: string;
  keySignature: string;
  lyrics?: string;
  audioUrl?: string;
  sheetMusicUrl?: string;
  videoUrl?: string;
  isApproved: boolean;
}

export default function AdminPage() {
  const pathname = usePathname();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const initialData: Song[] = [
    {
      id: "pending-1",
      title: "Missa de Angelis (Gloria)",
      composer: "Gregorian Chant",
      season: "Ordinary Time",
      role: "Gloria",
      keySignature: "Mode V",
      lyrics:
        "Gloria in excelsis Deo, et in terra pax hominibus bonae voluntatis...",
      sheetMusicUrl: "https://example.com/score.pdf",
      audioUrl: "https://example.com/audio.mp3",
      isApproved: false,
    },
    {
      id: "pending-2",
      title: "Tantum Ergo Sacramentum",
      composer: "St. Thomas Aquinas",
      season: "Ordinary Time",
      role: "Meditation / Motet",
      keySignature: "F Major",
      lyrics: "Tantum ergo Sacramentum veneremur cernui...",
      isApproved: false,
    },
    {
      id: "approved-1",
      title: "Panis Angelicus",
      composer: "César Franck",
      season: "Ordinary Time",
      role: "Communion Hymn",
      keySignature: "A Major",
      isApproved: true,
    },
    {
      id: "approved-2",
      title: "Veni, Veni, Emmanuel",
      composer: "Traditional Chant",
      season: "Advent",
      role: "Entrance Hymn",
      keySignature: "E Minor",
      isApproved: true,
    },
  ];

  useEffect(() => {
    setSongs(initialData);
    setLoading(false);
  }, []);

  const approveSong = (id: string) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === id ? { ...song, isApproved: true } : song,
      ),
    );
  };

  const deleteSong = (id: string) => {
    if (
      confirm("Are you sure you want to delete or reject this composition?")
    ) {
      setSongs((prev) => prev.filter((song) => song.id !== id));
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    setSongs((prev) =>
      prev.map((song) => (song.id === editingSong.id ? editingSong : song)),
    );
    setEditingSong(null);
  };

  const pendingSongs = songs.filter((s) => !s.isApproved);
  const approvedSongs = songs.filter((s) => s.isApproved);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-amber-200 flex flex-col">
      {/* Main Admin Dashboard */}
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
                          {song.season}
                        </span>
                        <span className="text-[11px] font-[family-name:var(--font-cinzel)] text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                          {song.role || "Liturgical Hymn"}
                        </span>
                        <span className="text-[11px] font-mono text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200">
                          {song.keySignature}
                        </span>
                      </div>

                      <h3 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
                        {song.title}
                      </h3>
                      <p className="text-xs font-[family-name:var(--font-cinzel)] italic text-stone-600">
                        Submitted composer: {song.composer}
                      </p>

                      {song.lyrics && (
                        <p className="text-xs font-[family-name:var(--font-cinzel)] italic text-stone-500 bg-stone-50 p-3 rounded border border-stone-200 line-clamp-2">
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-900 text-amber-100 font-[family-name:var(--font-cinzel)] text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-normal">Title</th>
                  <th className="py-3.5 px-4 font-normal">Composer</th>
                  <th className="py-3.5 px-4 font-normal">Season</th>
                  <th className="py-3.5 px-4 font-normal">Liturgical Role</th>
                  <th className="py-3.5 px-4 font-normal">Key</th>
                  <th className="py-3.5 px-4 font-normal text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-[family-name:var(--font-cinzel)] text-sm">
                {approvedSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {song.title}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 italic">
                      {song.composer}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-amber-900">
                      {song.season}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-600">
                      {song.role || "Hymn"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {song.keySignature}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-3">
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
          </div>
        )}
      </main>

      {/* Edit Composition Modal */}
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
                    Season
                  </label>
                  <select
                    value={editingSong.season}
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
                    <option value="Marian">Marian Feasts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                    Liturgical Role
                  </label>
                  <select
                    value={editingSong.role || "Entrance Hymn"}
                    onChange={(e) =>
                      setEditingSong({ ...editingSong, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] bg-white focus:outline-hidden focus:border-amber-800"
                  >
                    <option value="Entrance Hymn">Entrance Hymn</option>
                    <option value="Kyrie / Penitential">
                      Kyrie / Penitential
                    </option>
                    <option value="Gloria">Gloria</option>
                    <option value="Responsorial Psalm">
                      Responsorial Psalm
                    </option>
                    <option value="Gospel Acclamation">
                      Gospel Acclamation
                    </option>
                    <option value="Offertory / Gifts">Offertory / Gifts</option>
                    <option value="Sanctus">Sanctus (Holy, Holy, Holy)</option>
                    <option value="Memorial Acclamation">
                      Memorial Acclamation
                    </option>
                    <option value="Pater Noster">
                      Pater Noster (Lord&apos;s Prayer)
                    </option>
                    <option value="Agnus Dei">Agnus Dei (Lamb of God)</option>
                    <option value="Communion Hymn">Communion Hymn</option>
                    <option value="Meditation / Motet">
                      Meditation / Motet
                    </option>
                    <option value="Recessional / Closing">
                      Recessional / Closing
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-semibold mb-1">
                    Key Signature
                  </label>
                  <input
                    type="text"
                    value={editingSong.keySignature}
                    onChange={(e) =>
                      setEditingSong({
                        ...editingSong,
                        keySignature: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm font-[family-name:var(--font-cinzel)] focus:outline-hidden focus:border-amber-800 bg-white"
                  />
                </div>
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
