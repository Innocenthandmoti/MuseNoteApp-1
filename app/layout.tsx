import type { Metadata } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import { Header, Footer } from "@/components/AppNavigation";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MuseNote | Sacred Liturgical Music Treasury",
  description: "Classic sacred music planning and repository platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${garamond.variable}`}>
      <body className="font-[family-name:var(--font-garamond)] bg-[#FDFBF7] text-stone-900 antialiased selection:bg-amber-200 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
