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
    }
  });

  const usersCount = await prisma.user.count();
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      property: { select: { name: true, vendorProfile: { select: { businessName: true } } } },
      vehicle: { select: { make: true, model: true, vendorProfile: { select: { businessName: true } } } },
    },
    orderBy: { createdAt: 'desc' }
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
    }
  });

  const totalRevenue = bookings.filter(b => b.status === "CONFIRMED").reduce((acc, curr) => acc + curr.amount, 0);

  // Import dynamically or fetch directly
  const { getPayoutsSummary } = await import('@/actions/payouts');
  const payoutsResult = await getPayoutsSummary();
  const payouts = payoutsResult.success ? payoutsResult.payouts : [];

  const users = await prisma.user.findMany({
    where: { 
      role: { not: "ADMIN" } 
    },
    orderBy: { createdAt: 'desc' }
  });

  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <AdminDashboardClient tours={tours} vendors={vendors} properties={properties as any} totalUsers={usersCount} totalRevenue={totalRevenue} payouts={payouts} users={users} bookings={bookings as any} />;
}
