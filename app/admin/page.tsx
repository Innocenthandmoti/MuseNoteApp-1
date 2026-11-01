"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface MediaItem {
  id: string;
  title: string;
  composer: string;
  category?: string;
  season?: string;
  role?: string;
  audioUrl?: string;
  videoUrl?: string;
  lyrics?: string;
  isApproved: boolean;
  fileUrl?: string;
}

// 🔒 Reads admin emails dynamically from .env.local
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function AdminPage() {
  // Authentication & Gatekeeper States
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Moderation Panel States
  const [songs, setSongs] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing State
  const [editingSong, setEditingSong] = useState<MediaItem | null>(null);
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [category, setCategory] = useState("HYMN");
  const [season, setSeason] = useState("Ordinary Time");
  const [role, setRole] = useState("Entrance");
  const [customRole, setCustomRole] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  async function checkAdminAuth() {
    try {
      setCheckingAuth(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && session.user) {
        const userEmail = session.user.email?.trim().toLowerCase();
        if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
          setAdminUser(session.user);
          setAuthorized(true);
          fetchSongs();
        } else {
          setLoginError("This account is not authorized as an administrator.");
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setCheckingAuth(false);
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) throw error;

      const userEmail = data.user?.email?.trim().toLowerCase();
      if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
        setAdminUser(data.user);
        setAuthorized(true);
        fetchSongs();
      } else {
        setLoginError(
          "Access Denied: This email is not authorized as an administrator.",
        );
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to log in.");
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchSongs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("MediaItem")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching admin media items:", error);
    } else {
      setSongs(data || []);
    }
    setLoading(false);
  };

  const handleOpenEdit = (song: MediaItem) => {
    setEditingSong(song);
    setTitle(song.title || "");
    setComposer(song.composer || "");
    setCategory(song.category || "HYMN");
    setSeason(song.season || "Ordinary Time");

    const standardRoles = [
      "Entrance",
      "Kyrie",
      "Gloria",
      "Responsorial Psalm",
      "Gospel Acclamation",
      "Credo",
      "Prayer of the Faithful",
      "Offertory",
      "Sanctus",
      "Mystery of Faith",
      "Pater Noster",
      "Agnus Dei",
      "Communion",
      "Thanksgiving",
      "Recessional",
      "Marian Antiphon",
      "Benediction",
      "General",
    ];

    if (song.role && !standardRoles.includes(song.role)) {
      setRole("Other");
      setCustomRole(song.role);
    } else {
      setRole(song.role || "Entrance");
      setCustomRole("");
    }

    setAudioUrl(song.audioUrl || "");
    setVideoUrl(song.videoUrl || "");
    setLyrics(song.lyrics || "");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a valid PDF score document.");
        return;
      }
      setFileName(file.name);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    setSaving(true);
    try {
      let updatedFileUrl = editingSong.fileUrl;

      const selectedFile = fileInputRef.current?.files?.[0];
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `scores/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("media")
          .getPublicUrl(filePath);

        updatedFileUrl = publicUrlData.publicUrl;
      }

      const finalRole = role === "Other" ? customRole || "General" : role;

      const { error } = await supabase
        .from("MediaItem")
        .update({
          title,
          composer,
          category,
          season,
          role: finalRole,
          audioUrl: audioUrl || null,
          videoUrl: videoUrl || null,
          lyrics: lyrics || null,
          fileUrl: updatedFileUrl,
        })
        .eq("id", editingSong.id);

      if (error) throw error;

      alert("Composition updated successfully!");
      setEditingSong(null);
      fetchSongs();
    } catch (err: any) {
      alert(`Error updating score: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("MediaItem")
      .update({ isApproved: !currentStatus })
      .eq("id", id);

    if (error) {
      alert(`Error updating approval status: ${error.message}`);
    } else {
      fetchSongs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this composition?")) return;

    const { error } = await supabase.from("MediaItem").delete().eq("id", id);
    if (error) {
      alert(`Error deleting record: ${error.message}`);
    } else {
      fetchSongs();
    }
  };

  // 1. Loading state while verifying credentials
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-[family-name:var(--font-cinzel)] text-amber-900">
        Verifying administrator credentials...
      </div>
    );
  }

  // 2. Login Gate if not authorized
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-amber-900/20 p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Restricted Area
            </span>
            <h1 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              Administrator Sign In
            </h1>
            <p className="text-xs text-stone-600">
              Please sign in with your authorized admin account to access
              moderation.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded leading-relaxed">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 pr-10 text-sm text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 text-xs font-semibold select-none cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-amber-900 hover:bg-amber-950 text-amber-50 font-bold py-3 rounded text-xs tracking-wide uppercase font-[family-name:var(--font-cinzel)] cursor-pointer disabled:opacity-50 transition shadow-xs"
            >
              {loggingIn ? "Verifying..." : "Access Admin Dashboard"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-100">
            <a
              href="/"
              className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold"
            >
              ← Return to Main Application
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized View (Original Moderation Panel)
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 font-sans">
      <div className="border-b border-amber-900/20 pb-4 mb-8 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
            Administrative Control Panel
          </span>
          <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
            Score Moderation & Management
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-600 hidden sm:inline">
            Logged in as:{" "}
            <strong className="text-stone-900">{adminUser?.email}</strong>
          </span>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setAuthorized(false);
            }}
            className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer bg-amber-50 px-3 py-2 rounded border border-amber-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-900 border-t-transparent"></div>
        </div>
      ) : songs.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-lg p-12 text-center text-stone-500 italic">
          No compositions found in the database.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-amber-900/20 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/60 border-b border-amber-900/10 text-xs font-[family-name:var(--font-cinzel)] text-amber-900 uppercase">
                <th className="p-4">Title & Composer</th>
                <th className="p-4">Season & Role</th>
                <th className="p-4">Media Links & Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {songs.map((song) => (
                <tr key={song.id} className="hover:bg-stone-50/50 transition">
                  <td className="p-4">
                    <p className="font-bold text-stone-900 font-[family-name:var(--font-cinzel)]">
                      {song.title}
                    </p>
                    <p className="text-xs text-stone-500 italic">
                      By {song.composer || "Unknown"}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-semibold text-amber-900">
                      {song.season || "Ordinary Time"}
                    </p>
                    <p className="text-xs text-stone-600 bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-200/60 mt-1">
                      Role: {song.role || "General"}
                    </p>
                  </td>
                  <td className="p-4 text-xs space-y-1">
                    {song.audioUrl ? (
                      <a
                        href={song.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-800 hover:underline block truncate max-w-xs"
                      >
                        🎵 Audio Link Attached
                      </a>
                    ) : (
                      <span className="text-stone-400 block">No Audio</span>
                    )}
                    {song.videoUrl ? (
                      <a
                        href={song.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-800 hover:underline block truncate max-w-xs"
                      >
                        🎬 Video Link Attached
                      </a>
                    ) : (
                      <span className="text-stone-400 block">No Video</span>
                    )}
                    {song.fileUrl ? (
                      <a
                        href={song.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-700 font-bold hover:underline block"
                      >
                        📄 View PDF Score ↗
                      </a>
                    ) : (
                      <span className="text-stone-400 block">No PDF</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        song.isApproved
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {song.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(song)}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleToggleApproval(song.id, song.isApproved)
                      }
                      className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                        song.isApproved
                          ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                          : "bg-green-700 text-white hover:bg-green-800"
                      }`}
                    >
                      {song.isApproved ? "Unapprove" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleDelete(song.id)}
                      className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
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

      {/* Edit Modal */}
      {editingSong && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-xl border border-amber-900/20">
            <div className="flex justify-between items-center border-b border-amber-900/15 pb-4">
              <h2 className="text-xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
                Edit Sacred Composition
              </h2>
              <button
                onClick={() => setEditingSong(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
                />
              </div>

              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Composer / Source
                </label>
                <input
                  type="text"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
                  >
                    <option value="HYMN">Hymn</option>
                    <option value="CHANT">Gregorian Chant</option>
                    <option value="POLYPHONY">Sacred Polyphony</option>
                    <option value="MASS_SETTING">Mass Setting</option>
                    <option value="MOTET">Motet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                    Liturgical Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
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

              {/* Liturgical Role Selection */}
              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Liturgical Role / Part of Mass
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
                >
                  <option value="Entrance">Entrance Hymn / Introit</option>
                  <option value="Kyrie">Kyrie (Lord Have Mercy)</option>
                  <option value="Gloria">Gloria (Glory to God)</option>
                  <option value="Responsorial Psalm">Responsorial Psalm</option>
                  <option value="Gospel Acclamation">
                    Gospel Acclamation / Alleluia
                  </option>
                  <option value="Credo">
                    Credo (I Believe / Nicene-Apostles Creed)
                  </option>
                  <option value="Prayer of the Faithful">
                    Prayer of the Faithful (Universal Prayer)
                  </option>
                  <option value="Offertory">
                    Offertory / Presentation of Gifts
                  </option>
                  <option value="Sanctus">Sanctus (Holy, Holy, Holy)</option>
                  <option value="Mystery of Faith">
                    Mystery of Faith / Memorial Acclamation
                  </option>
                  <option value="Pater Noster">
                    Pater Noster (Our Father)
                  </option>
                  <option value="Agnus Dei">Agnus Dei (Lamb of God)</option>
                  <option value="Communion">
                    Communion Processional / Hymn
                  </option>
                  <option value="Thanksgiving">
                    Post-Communion / Thanksgiving
                  </option>
                  <option value="Recessional">Recessional / Dismissal</option>
                  <option value="Marian Antiphon">Marian Antiphon</option>
                  <option value="Benediction">Benediction / Adoration</option>
                  <option value="General">General / Meditation</option>
                  <option value="Other">Other (Specify below)</option>
                </select>

                {role === "Other" && (
                  <input
                    type="text"
                    required
                    placeholder="Specify part of Mass / liturgical role..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="mt-2 w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                    Audio Link{" "}
                    <span className="text-stone-400 font-normal lowercase">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                    Video Link{" "}
                    <span className="text-stone-400 font-normal lowercase">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Lyrics & Stanzas
                </label>
                <textarea
                  rows={4}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-700"
                />
              </div>

              {/* PDF File Upload */}
              <div>
                <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-1">
                  Replace PDF Score Document{" "}
                  <span className="text-stone-400 font-normal lowercase">
                    (optional)
                  </span>
                </label>
                <div className="border-2 border-dashed border-amber-900/30 rounded-sm p-4 text-center bg-[#FDFBF7] hover:bg-amber-50/40 transition">
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="edit-pdf-upload"
                  />
                  <label
                    htmlFor="edit-pdf-upload"
                    className="cursor-pointer space-y-1 block"
                  >
                    <span className="text-xl block text-amber-800">📄</span>
                    <span className="text-xs font-semibold text-stone-800 block">
                      {fileName
                        ? `New File: ${fileName}`
                        : editingSong.fileUrl
                          ? "Current PDF attached (click to replace)"
                          : "Click to browse device for PDF score"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingSong(null)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-900 hover:bg-amber-950 text-amber-50 px-6 py-2 rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Score Edits"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
