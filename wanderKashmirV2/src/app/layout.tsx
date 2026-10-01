import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/themeProvider";
import ThemeTestingControl from "@/components/ThemeTestingControl";

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
  title: "WanderKashmir | Curated Kashmir Tour Packages, Dal Lake Houseboats & Local Stays",
  description:
    "Explore Kashmir with direct local itineraries, heritage houseboats on Dal Lake, boutique alpine stays, and verified mountain drivers managed directly from Srinagar.",
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
          <ThemeTestingControl />
        </ThemeProvider>
      </body>
    </html>
  );
}
