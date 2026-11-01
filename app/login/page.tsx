"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        // Register new user
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        setSuccessMsg("🎉 Account created successfully! You can now sign in.");
        setIsSignUp(false); // Switch to sign-in mode
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        alert("Successfully signed in!");
        router.push("/hymns"); // Send them to your hymn catalog
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-amber-900/20 p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
            Musenote Portal
          </span>
          <h1 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
            {isSignUp ? "Create an Account" : "Sign In to Musenote"}
          </h1>
          <p className="text-xs text-stone-600">
            {isSignUp
              ? "Register to upload scores and manage liturgical music."
              : "Welcome back! Please enter your details."}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded leading-relaxed">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase font-bold text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            disabled={loading}
            className="w-full bg-amber-900 hover:bg-amber-950 text-amber-50 font-bold py-3 rounded text-xs tracking-wide uppercase font-[family-name:var(--font-cinzel)] cursor-pointer disabled:opacity-50 transition shadow-xs"
          >
            {loading
              ? "Processing..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <div className="text-center space-y-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-xs text-amber-900 hover:underline font-semibold cursor-pointer block w-full"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Need an account? Sign Up"}
          </button>

          <button
            onClick={() => router.push("/hymns")}
            className="text-xs font-[family-name:var(--font-cinzel)] text-stone-500 hover:text-stone-800 font-semibold cursor-pointer block w-full"
          >
            ← Back to Public Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
