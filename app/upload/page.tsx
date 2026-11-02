"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// 🔒 Reads admin emails dynamically from .env.local to auto-approve admins
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function UploadPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<
    "none" | "pending" | "approved" | "rejected"
  >("none");

  // User Auth Form States (For non-admin contributors)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Contributor Registration States
  const [contributorName, setContributorName] = useState("");
  const [contributorBio, setContributorBio] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Original Upload Form States
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
    checkUserPermissions();
  }, []);

  async function checkUserPermissions() {
    try {
      setLoadingAuth(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        setCurrentUser(null);
        setLoadingAuth(false);
        return;
      }

      const user = session.user;
      setCurrentUser(user);

      // Check if user is an administrator
      const userEmail = user.email?.trim().toLowerCase() || "";
      if (ADMIN_EMAILS.includes(userEmail)) {
        setRequestStatus("approved");
        setLoadingAuth(false);
        return;
      }

      // Check contributor registration status from public.upload_requests table
      const { data, error } = await supabase
        .from("upload_requests")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching request status:", error);
      } else if (data) {
        setRequestStatus(data.status as any);
      } else {
        setRequestStatus("none");
      }
    } catch (err) {
      console.error("Auth permission check error:", err);
    } finally {
      setLoadingAuth(false);
    }
  }

  // Handle User Sign In or Sign Up directly from Upload Page
  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser(data.user);
          alert(
            "Account created successfully! You can now submit your contributor registration.",
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser(data.user);
          checkUserPermissions();
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterAsContributor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmittingRequest(true);

    try {
      const { error } = await supabase.from("upload_requests").insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        status: "pending",
      });

      if (error) throw error;

      setRequestStatus("pending");
      alert(
        "Your registration as a Score Contributor has been submitted successfully! Waiting for admin approval.",
      );
    } catch (err: any) {
      alert(`Error submitting registration: ${err.message}`);
    } finally {
      setSubmittingRequest(false);
    }
  };

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
      const fileName = `${Date.now()}_${file.name}`;
      const { error: storageError } = await supabase.storage
        .from("scores")
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage
        .from("scores")
        .getPublicUrl(fileName);

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
        isApproved: false, // Enters moderation queue
      });

      if (dbError) throw dbError;

      alert(
        "🎉 Score uploaded successfully! It is now pending administrative review.",
      );
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

  // Prevent server/client hydration mismatch
  if (!mounted || loadingAuth) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-[family-name:var(--font-cinzel)] text-amber-900">
        Loading upload portal...
      </div>
    );
  }

  // 1. Unauthenticated Gate: User Sign In / Register Form specifically for Uploaders
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-xl border border-amber-900/20 p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Contributor Portal
            </span>
            <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              {authMode === "signin"
                ? "Sign In to Upload"
                : "Register as Contributor"}
            </h1>
            <p className="text-xs text-stone-600">
              Sign in or create an account to request score upload privileges.
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded">
              {authError}
            </div>
          )}

          <form onSubmit={handleUserAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-amber-900 hover:bg-amber-950 text-amber-50 font-bold py-3 rounded text-xs tracking-wide uppercase font-[family-name:var(--font-cinzel)] cursor-pointer transition disabled:opacity-50 shadow-xs"
            >
              {authLoading
                ? "Processing..."
                : authMode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-100 space-y-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "signin" ? "signup" : "signin");
                setAuthError("");
              }}
              className="text-xs text-amber-900 hover:underline font-semibold cursor-pointer block w-full"
            >
              {authMode === "signin"
                ? "Don't have an account? Register here"
                : "Already have an account? Sign in"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/hymns")}
              className="text-xs font-[family-name:var(--font-cinzel)] text-stone-600 hover:underline cursor-pointer block w-full"
            >
              ← Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Contributor Registration Form (If logged in but status is "none")
  if (requestStatus === "none") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12 flex items-center justify-center">
        <div className="max-w-lg w-full space-y-6 bg-white rounded-xl border border-amber-900/20 p-8 shadow-xs">
          <div className="border-b border-amber-900/10 pb-4 text-center space-y-2">
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Uploader Onboarding
            </span>
            <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
              Register as a Score Contributor
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Signed in as{" "}
              <strong className="text-stone-900">{currentUser.email}</strong>.
              Submit your registration below for administrator approval before
              uploading.
            </p>
          </div>

          <form onSubmit={handleRegisterAsContributor} className="space-y-4">
            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Your Full Name or Choir Group *
              </label>
              <input
                type="text"
                required
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="e.g. St. Augustine Choir"
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded px-3 py-2 text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
                Brief Note to Administrator (Optional)
              </label>
              <textarea
                rows={3}
                value={contributorBio}
                onChange={(e) => setContributorBio(e.target.value)}
                placeholder="Tell the admin what kind of scores you plan to upload..."
                className="w-full bg-[#FDFBF7] border border-stone-300 rounded p-3 text-xs text-stone-900 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submittingRequest}
              className="w-full bg-amber-900 hover:bg-amber-950 text-amber-50 font-bold py-3 rounded text-xs tracking-wide uppercase font-[family-name:var(--font-cinzel)] cursor-pointer disabled:opacity-50 transition shadow-xs"
            >
              {submittingRequest
                ? "Submitting Registration..."
                : "Submit Contributor Registration"}
            </button>
          </form>

          <div className="flex justify-between items-center pt-2 border-t border-stone-100">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setCurrentUser(null);
              }}
              className="text-xs text-red-700 hover:underline font-semibold cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={() => router.push("/hymns")}
              className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer"
            >
              ← Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Pending or Rejected Registration Status Screen
  if (requestStatus === "pending" || requestStatus === "rejected") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-amber-900/20 p-8 text-center space-y-6 shadow-xs">
          <div className="space-y-2">
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Registration Status
            </span>
            <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              {requestStatus === "pending"
                ? "Registration Pending Review"
                : "Registration Declined"}
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              {requestStatus === "pending"
                ? "Your contributor registration has been submitted and is awaiting review by the administrator. Once approved, you will be able to upload scores."
                : "Your request to register as a contributor was not approved by the administrator."}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-stone-100">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setCurrentUser(null);
              }}
              className="text-xs text-red-700 hover:underline font-semibold cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={() => router.push("/hymns")}
              className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer"
            >
              ← Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Approved View (Your Original Upload Form)
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-2xl mx-auto space-y-6 bg-white rounded-xl border border-amber-900/20 p-8 shadow-xs">
        <div className="border-b border-amber-900/10 pb-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Approved Contributor Portal
            </span>
            <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              Upload Sacred Score
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setCurrentUser(null);
              }}
              className="text-xs text-stone-500 hover:text-red-700 cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={() => router.push("/hymns")}
              className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer"
            >
              ← Catalog
            </button>
          </div>
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
