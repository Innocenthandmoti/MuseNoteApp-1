import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuseNote - Sacred Repertoire Repository",
  description: "Manage and catalog liturgical music collections",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Load Cinzel cleanly via Google Fonts CDN to avoid Turbopack internal resolution bugs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#FDFBF7] text-stone-900">
        {children}
      </body>
    </html>
  );
}
