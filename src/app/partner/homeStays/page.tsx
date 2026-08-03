import { getVendorSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import HomestayClient from "./HomestayClient";
import { redirect } from "next/navigation";

export default async function HomestayDashboardPage() {
  const session = await getVendorSession();

  if (!session || !session.vendorProfileId) {
    redirect("/partner");
  }

  // Fetch properties belonging to this vendor
  const properties = await prisma.property.findMany({
    where: { vendorProfileId: session.vendorProfileId },
    orderBy: { createdAt: "desc" },
    include: {
      roomTypes: {
        include: {
          inventories: true,
        },
      },
    },
  });

  // Fetch bookings for this vendor's properties
  const bookings = await prisma.booking.findMany({
    where: {
      property: {
        vendorProfileId: session.vendorProfileId,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <HomestayClient vendorProfileId={session.vendorProfileId} properties={properties} bookings={bookings} />;
}
