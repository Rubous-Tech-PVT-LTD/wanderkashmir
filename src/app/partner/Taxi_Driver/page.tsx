import { getVendorSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TaxiClient from "./TaxiClient";
import { redirect } from "next/navigation";

export default async function TaxiDashboardPage() {
  const session = await getVendorSession();

  if (!session || !session.vendorProfileId) {
    redirect("/partner");
  }

  // Fetch vehicles belonging to this vendor
  const vehicles = await prisma.vehicle.findMany({
    where: { vendorProfileId: session.vendorProfileId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch drivers belonging to this vendor
  const drivers = await prisma.driver.findMany({
    where: { vendorProfileId: session.vendorProfileId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch bookings for this vendor's vehicles
  const bookings = await prisma.booking.findMany({
    where: {
      vehicle: {
        vendorProfileId: session.vendorProfileId,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <TaxiClient vehicles={vehicles} drivers={drivers} bookings={bookings} />;
}
