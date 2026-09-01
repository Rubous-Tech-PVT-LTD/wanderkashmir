import { getVendorSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import HotelClient from "./HotelClient";
import { redirect } from "next/navigation";

export default async function HotelDashboardPage() {
  const session = await getVendorSession();

  if (!session || !session.vendorProfileId) {
    redirect("/partner");
  }

  let properties: any[] = [];
  let bookings: any[] = [];

  try {
    properties = await prisma.property.findMany({
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
  } catch (err) {
    console.error("Error fetching vendor properties with roomTypes:", err);
    try {
      properties = await prisma.property.findMany({
        where: { vendorProfileId: session.vendorProfileId },
        orderBy: { createdAt: "desc" },
      });
    } catch (fallbackErr) {
      console.error("Fallback property query error:", fallbackErr);
      properties = [];
    }
  }

  try {
    bookings = await prisma.booking.findMany({
      where: {
        property: {
          vendorProfileId: session.vendorProfileId,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error fetching vendor bookings:", err);
    bookings = [];
  }

  const safeProperties = JSON.parse(JSON.stringify(properties));
  const safeBookings = JSON.parse(JSON.stringify(bookings));

  return <HotelClient vendorProfileId={session.vendorProfileId} properties={safeProperties} bookings={safeBookings} />;
}
