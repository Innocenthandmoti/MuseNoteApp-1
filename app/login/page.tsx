"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Registration successful! Please check your email or log in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        alert("Logged in successfully!");
        router.push("/upload");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <div className="text-center mb-8">
        <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
          MuseNote Authentication
        </span>
        <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-3">
          {isSignUp ? "Create an Account" : "Sign In to Upload"}
        </h1>
        <p className="text-stone-600 text-sm italic mt-1">
          {isSignUp
            ? "Register to begin submitting sacred scores to the registry."
            : "Welcome back! Please enter your credentials to continue."}
        </p>
      </div>

      <form
        onSubmit={handleAuth}
        className="bg-white p-8 rounded-md border border-amber-900/20 shadow-sm space-y-5"
      >
        <div>
          <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            placeholder="chorister@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
          />
        </div>

        <div>
          <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm px-3.5 py-2.5 pr-10 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 text-xs font-medium cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-[family-name:var(--font-cinzel)] tracking-wider font-semibold py-3 rounded-sm shadow transition cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading
            ? "Processing..."
            : isSignUp
              ? "Register Account"
              : "Sign In"}
        </button>

        <div className="text-center pt-4 border-t border-amber-900/10">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-amber-900 hover:underline font-medium cursor-pointer"
          >
            {isSignUp
              ? "Already have an account? Sign in here"
              : "Don't have an account? Register here"}
          </button>
        </div>
      </form>
    </div>
  );
}
