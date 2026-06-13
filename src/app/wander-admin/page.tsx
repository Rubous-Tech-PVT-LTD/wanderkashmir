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

  const userId = session.userId;

  const vendors = await prisma.vendorProfile.findMany({
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 1000
  });

  const usersCount = await prisma.user.count();
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      property: { select: { name: true, vendorProfile: { select: { businessName: true } } } },
      vehicle: { select: { make: true, model: true, vendorProfile: { select: { businessName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 1000
  });
  
  const properties = await prisma.property.findMany({
    include: {
      vendorProfile: {
        include: {
          user: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 1000
  });

  const revenueAgg = await prisma.booking.aggregate({
    where: { status: "CONFIRMED" },
    _sum: { amount: true }
  });
  const totalRevenue = revenueAgg._sum.amount || 0;

  // Import dynamically or fetch directly
  const { getPayoutsSummary } = await import('@/actions/payouts');
  const payoutsResult = await getPayoutsSummary();
  const payouts = payoutsResult.success ? payoutsResult.payouts : [];

  const users = await prisma.user.findMany({
    where: { 
      role: { not: "ADMIN" } 
    },
    orderBy: { createdAt: 'desc' },
    take: 1000
  });

  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000
  });

  return <AdminDashboardClient tours={tours} vendors={vendors} properties={properties as any} totalUsers={usersCount} totalRevenue={totalRevenue} payouts={payouts} users={users} bookings={bookings as any} />;
}
