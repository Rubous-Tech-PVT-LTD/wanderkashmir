import { getVendorSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import HotelDashboard from "../hotel/page";
import HomeStaysDashboard from "../homeStays/page";
import TransportDashboard from "../Taxi_Driver/page";
import GuideDashboard from "../Guide/page";
import { redirect } from "next/navigation";
import { getVendorBookings } from "@/actions/bookings";

export default async function DynamicVendorDashboard() {
  const session = await getVendorSession();
  
  if (!session || (session.role !== "VENDOR" && session.role !== "ADMIN")) {
    redirect("/partner/login");
  }
  
  const userId = session.userId;

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
    include: {
      properties: true,
      vehicles: true
    }
  });

  if (!vendorProfile) {
    redirect("/partner");
  }

  // Fetch bookings for this vendor
  const bookingsRes = await getVendorBookings(vendorProfile.id, vendorProfile.type);
  const bookings = bookingsRes.success ? bookingsRes.bookings : [];

  switch (vendorProfile.type) {
    case "HOTEL":
      return <HotelDashboard properties={vendorProfile.properties} bookings={bookings} />;
    case "HOMESTAY":
      return <HomeStaysDashboard bookings={bookings} />;
    case "TAXI":
      return <TransportDashboard bookings={bookings} />;
    case "GUIDE":
      return <GuideDashboard bookings={bookings} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-bold text-slate-900">Welcome to your dashboard</h2>
          <p className="text-slate-500 mt-2">Please select a service to manage.</p>
        </div>
      );
  }
}
