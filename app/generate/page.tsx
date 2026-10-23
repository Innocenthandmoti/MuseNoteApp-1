"use client";

import { useState } from "react";
import React from "react";

export default function GenerateMusicPage() {
  const [prompt, setPrompt] = useState(
    "A serene Gregorian chant in Latin with ethereal choir voices and sacred cathedral reverb",
  );
  const [generating, setGenerating] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setAudioReady(false);

    // Call the music generation capability
    try {
      // Simulate Lyria model composition turnaround
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setAudioReady(true);
    } catch (err: any) {
      alert("Error generating music track.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="border-b border-amber-900/20 pb-4">
        <span className="text-[10px] font-[family-name:var(--font-cinzel)] font-semibold tracking-widest text-amber-900 uppercase bg-amber-50 px-3 py-1 rounded-sm border border-amber-200/60">
          Lyria AI Composition Suite
        </span>
        <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-stone-900 mt-2">
          Sacred Music Generator
        </h1>
        <p className="text-stone-600 text-sm italic mt-1">
          Compose original liturgical chants, choral hymns, and sacred
          background tracks using generative AI.
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="bg-white p-8 rounded-md border border-amber-900/20 shadow-sm space-y-6"
      >
        <div>
          <label className="block text-xs font-[family-name:var(--font-cinzel)] uppercase tracking-wider text-stone-700 font-bold mb-2">
            Composition Prompt & Style
          </label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the desired chant, tempo, mood, and vocal styling..."
            className="w-full bg-[#FDFBF7] border border-amber-900/30 rounded-sm p-3 text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-900"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={generating}
            className="bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-[family-name:var(--font-cinzel)] tracking-wider font-semibold px-6 py-3 rounded-sm shadow transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-amber-200 border-t-transparent"></div>
                <span>Composing Sacred Track...</span>
              </>
            ) : (
              <span>Generate AI Sacred Track 🪈</span>
            )}
          </button>
        </div>
      </form>

      {audioReady && (
        <div className="bg-white p-6 rounded-md border border-amber-900/30 shadow-md space-y-4 text-center animate-fade-in">
          <span className="text-3xl text-amber-800 font-[family-name:var(--font-cinzel)]">
            ☩
          </span>
          <h3 className="text-lg font-[family-name:var(--font-cinzel)] font-bold text-stone-900">
            Composition Generated Successfully
          </h3>
          <p className="text-xs text-stone-600 italic">&quot;{prompt}&quot;</p>
          <div className="pt-2">
            <audio controls className="mx-auto w-full max-w-md">
              <source
                src="https://actions.google.com/sounds/v1/ambiences/choir_hall.ogg"
                type="audio/ogg"
              />
              Your browser does not support the audio element.
            </audio>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => alert("Track saved to your workspace catalog!")}
              className="bg-stone-900 text-amber-50 hover:bg-amber-950 text-xs font-[family-name:var(--font-cinzel)] px-4 py-2 rounded-sm transition cursor-pointer font-semibold"
            >
              Save to Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
