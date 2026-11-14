import type { Metadata } from "next";
import { Header, Footer } from "@/components/AppNavigation";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FDFBF7] text-stone-900 antialiased selection:bg-amber-200 min-h-screen flex flex-col font-serif">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
