"use client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-[family-name:var(--font-garamond)] selection:bg-amber-200">
      {/* Notice: No <Header /> here! The root layout (app/layout.tsx) already renders it globally. */}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
