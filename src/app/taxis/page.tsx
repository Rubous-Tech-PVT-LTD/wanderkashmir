import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TaxisClient from "@/app/taxis/TaxisClient";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kashmir Taxis & Transport | WanderKashmir",
  description: "Book verified cabs and taxis for sightseeing in Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
};

export const revalidate = 60;

export default async function TaxisPage() {
  // Fetch real rate cards
  const ratesData = await prisma.taxiRateCard.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const imagesData = await prisma.taxiTypeImage.findMany();
  const imagesMap: Record<string, string> = {};
  imagesData.forEach(img => imagesMap[img.type] = img.imageUrl);

  // Fetch verified drivers
  const verifiedDrivers = await prisma.vendorProfile.findMany({
    where: { 
      type: 'TAXI',
      isApproved: true
    },
    select: {
      id: true,
      vehicleType: true,
      vehicleRegistration: true,
      experienceYears: true,
      kycDocuments: true, // to get a profile pic if any
      rateOverrides: true,
      vehicles: true
    }
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <TaxisClient rateCards={ratesData} imagesMap={imagesMap} verifiedDrivers={verifiedDrivers} />
      <Footer />
    </main>
  );
}
