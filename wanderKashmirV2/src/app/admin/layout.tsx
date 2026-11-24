import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | WanderKashmir",
  description: "WanderKashmir Travel Operations & CMS Workspace",
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased font-sans selection:bg-emerald-800 selection:text-white">
      {children}
    </div>
  );
}
