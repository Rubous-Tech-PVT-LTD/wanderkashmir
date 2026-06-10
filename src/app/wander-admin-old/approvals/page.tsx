import prisma from "@/lib/prisma";
import ApprovalsClient from "./ApprovalsClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ApprovalsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-6">You do not have administrator privileges to view this page.</p>
          <a href="/" className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Return Home
          </a>
        </div>
      </div>
    );
  }
  const pendingApprovals = await prisma.vendorProfile.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  return <ApprovalsClient initialVendors={pendingApprovals as any} />;
}
