import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "optional",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WanderKashmir CRM - Partner Portal",
  description: "B2B CRM and Partner Portal for WanderKashmir",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClasses = `${plusJakartaSans.variable} ${inter.variable}`;

  return (
    <html lang="en" className={fontClasses} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
