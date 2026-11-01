"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// 🔒 ADD YOUR ACTUAL EMAIL HERE (e.g., ["john@gmail.com", "admin@parish.org"])
const ADMIN_EMAILS = ["your-email@gmail.com"];

export default function AdminPage() {
  const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    checkAdminAuth();
  }, []);

  async function checkAdminAuth() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && session.user) {
        const userEmail = session.user.email?.toLowerCase();
        if (
          userEmail &&
          ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(userEmail)
        ) {
          setAdminUser(session.user);
          setAuthorized(true);
        } else {
          setLoginError(
            "This account is not in the authorized administrator list.",
          );
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const userEmail = data.user?.email?.toLowerCase();
      if (
        userEmail &&
        ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(userEmail)
      ) {
        setAdminUser(data.user);
        setAuthorized(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-[family-name:var(--font-cinzel)] text-amber-900">
        Verifying administrator credentials...
      </div>
    );
  }

  // Admin Sign-in Gate
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
              Please sign in with your authorized admin account to access the
              dashboard.
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <button
              onClick={() => router.push("/")}
              className="text-xs font-[family-name:var(--font-cinzel)] text-amber-900 hover:underline font-semibold cursor-pointer"
            >
              ← Return to Main Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view for authorized admin
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="border-b border-amber-900/10 pb-4 flex justify-between items-center bg-white p-6 rounded-xl border border-amber-900/20 shadow-xs">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
              Restricted Area
            </span>
            <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
              Liturgical Administrator Dashboard
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

        <div className="bg-white rounded-xl border border-amber-900/20 p-8 shadow-xs">
          <h2 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mb-4">
            Pending Submissions & Catalog Management
          </h2>
          <p className="text-xs text-stone-600">
            Welcome, Administrator. You have secure access to manage songs,
            approve uploads, and oversee parish content.
          </p>
        </div>
      </div>
    </div>
  );
}
