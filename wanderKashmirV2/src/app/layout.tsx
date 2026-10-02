import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/themeProvider";
import LeadPopupController from "@/components/LeadPopupController";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.wanderkashmir.com"),
  title: {
    default: "WanderKashmir | Curated Kashmir Tour Packages, Dal Lake Houseboats & Local Stays",
    template: "%s | WanderKashmir",
  },
  description:
    "Explore Kashmir with direct local itineraries, heritage houseboats on Dal Lake, boutique alpine stays, and verified mountain drivers managed directly from Srinagar.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dcmoseix9/image/upload/v1790940410/favicon_fbpa6r.ico",
        sizes: "32x32",
      },
      {
        url: "https://res.cloudinary.com/dcmoseix9/image/upload/v1790940411/favicon_px8xdy.svg",
        type: "image/svg+xml",
      },
      {
        url: "https://res.cloudinary.com/dcmoseix9/image/upload/v1790940410/favicon-96x96_jtczpk.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://res.cloudinary.com/dcmoseix9/image/upload/v1790940409/apple-touch-icon_gkpbmz.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    siteName: "WanderKashmir",
    locale: "en_IN",
    type: "website",
    url: "https://www.wanderkashmir.com",
    title: "WanderKashmir | Curated Kashmir Tour Packages, Dal Lake Houseboats & Local Stays",
    description:
      "Explore Kashmir with direct local itineraries, heritage houseboats on Dal Lake, boutique alpine stays, and verified mountain drivers managed directly from Srinagar.",
    images: [
      {
        url: "/images/dal-lake-hero.png",
        width: 1200,
        height: 630,
        alt: "WanderKashmir - Curated Kashmir Travel Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WanderKashmir | Curated Kashmir Tour Packages, Dal Lake Houseboats & Local Stays",
    description:
      "Explore Kashmir with direct local itineraries, heritage houseboats on Dal Lake, boutique alpine stays, and verified mountain drivers managed directly from Srinagar.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-[var(--season-text)] antialiased transition-colors duration-200">
        <ThemeProvider>
          {children}
          <LeadPopupController />
        </ThemeProvider>
      </body>
    </html>
  );
}
