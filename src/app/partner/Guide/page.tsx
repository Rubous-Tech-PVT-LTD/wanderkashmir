import { getVendorSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import GuideClient from "./GuideClient";
import { redirect } from "next/navigation";

export default async function GuideDashboardPage() {
  const session = await getVendorSession();

  if (!session || !session.vendorProfileId) {
    redirect("/partner");
  }

  // Fetch Guide profile belonging to this vendor
  const guideProfile = await prisma.guideProfile.findFirst({
    where: { vendorProfileId: session.vendorProfileId },
  });

  // Fetch bookings for this guide
  let bookings: any[] = [];
  if (guideProfile) {
    bookings = await prisma.booking.findMany({
      where: { guideProfileId: guideProfile.id },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <GuideClient 
      bookings={bookings} 
      vendorProfileId={session.vendorProfileId} 
      initialGuideProfile={guideProfile} 
    />
  );
}
