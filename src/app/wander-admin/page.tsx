import prisma from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// This is a Server Component. It fetches data directly from the DB on the server.
export default async function AdminPage() {
  const session = await getAdminSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/wander-admin/login");
  }

  // Only fetch initial aggregated data to keep server response lightning fast
  const [
    usersCount,
    revenueAgg,
    totalLiveVendors,
    pendingVendors,
    rejectedVendors
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { amount: true } }),
    prisma.vendorProfile.count({ where: { isApproved: true, status: { not: "SUSPENDED" } } }),
    prisma.vendorProfile.count({ where: { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } } }),
    prisma.vendorProfile.count({ where: { status: "REJECTED" } }),
  ]);

  const totalRevenue = revenueAgg._sum.amount || 0;

  // Import dynamically or fetch directly
  const { getPayoutsSummary } = await import('@/actions/payouts');
  const payoutsResult = await getPayoutsSummary();
  const payouts = payoutsResult.success ? payoutsResult.payouts : [];

  return <AdminDashboardClient 
    totalUsers={usersCount} 
    totalRevenue={totalRevenue} 
    totalLiveVendors={totalLiveVendors}
    pendingVendors={pendingVendors}
    rejectedVendors={rejectedVendors}
    payouts={payouts} 
  />;
}
