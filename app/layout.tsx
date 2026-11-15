import type { Metadata, Viewport } from "next";
import { Header, Footer } from "@/components/AppNavigation";
import "./globals.css";

// 🌍 Define your production domain for canonical URLs and absolute share images
const PRODUCTION_URL = "https://muse-note-app-3.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_URL),
  title: {
    default: "MuseNote | Sacred Liturgical Music Treasury & Hymn Repository",
    template: "%s | MuseNote Sacred Music",
  },
  description:
    "Discover, plan, and repository classic sacred music, Catholic hymns, choral scores, and liturgical chants. Listen to audio previews and browse sheet music.",
  keywords: [
    "sacred music",
    "liturgical music",
    "hymn repository",
    "Catholic hymns",
    "choral scores",
    "sheet music platform",
    "mass music planning",
    "MuseNote",
  ],
  authors: [{ name: "MuseNote Team" }],
  creator: "MuseNote",
  publisher: "MuseNote Sacred Music",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // 🔍 Canonical & Indexing Rules
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // 🔑 Google Search Console Verification (Replace YOUR_CODE_HERE with your code)
  verification: {
    google: "LTBfngLn2G0vIW-AttnV1d6ljMxdnH3NtwMOl42o4FA",
  },
  // 📱 Open Graph for Social Sharing (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PRODUCTION_URL,
    title: "MuseNote | Sacred Liturgical Music Treasury",
    description:
      "Classic sacred music planning and repository platform for choirs, directors, and musicians.",
    siteName: "MuseNote",
    images: [
      {
        url: `${PRODUCTION_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "MuseNote Sacred Liturgical Music Treasury",
      },
    ],
  },
  // 🐦 Twitter Card Metadata
  twitter: {
    card: "summary_large_image",
    title: "MuseNote | Sacred Liturgical Music Treasury",
    description:
      "Classic sacred music planning and repository platform for choirs and musicians.",
    images: [`${PRODUCTION_URL}/og-image.jpg`],
  },
};

// 📱 Viewport settings for optimal mobile search scaling
export const viewport: Viewport = {
  themeColor: "#FDFBF7",
  width: "device-width",
  initialScale: 1,
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
