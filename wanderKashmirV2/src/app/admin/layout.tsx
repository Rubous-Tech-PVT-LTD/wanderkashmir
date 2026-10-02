import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | WanderKashmir",
  description: "WanderKashmir Administration Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased font-sans selection:bg-emerald-500 selection:text-white">
      {children}
    </div>
  );
}
