import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import BookingsClient from "./BookingsClient";

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(session.role);
  const whereClause = isAdminOrManager ? {} : { baId: session.userId };

  const bookings = await prisma.crmBooking.findMany({
    where: whereClause,
    include: {
      partner: {
        select: { companyName: true }
      },
      requirement: {
        select: { customerName: true, destinations: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch BA names manually since there is no relation in schema
  const baIds = [...new Set(bookings.map(b => b.baId))];
  const bas = await prisma.crmUser.findMany({
    where: { id: { in: baIds } },
    select: { id: true, name: true }
  });
  
  const baMap = Object.fromEntries(bas.map(ba => [ba.id, ba.name]));

  const bookingsWithBa = bookings.map(b => ({
    ...b,
    baName: baMap[b.baId] || "Unknown BA"
  }));

  return <BookingsClient bookings={bookingsWithBa} isAdmin={isAdminOrManager} />;
}
