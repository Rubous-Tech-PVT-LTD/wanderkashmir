import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TaxisClient, { TaxiItem } from "@/app/taxis/TaxisClient";
import prisma from "@/lib/prisma";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kashmir Taxis & Transport | WanderKashmir",
  description: "Book verified cabs and taxis for sightseeing in Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
};

export const revalidate = 60;

export default async function TaxisPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const initialQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : "";

  // Fetch real vehicles from the database
  const vehiclesData = await prisma.vehicle.findMany({
    include: {
      vendorProfile: true, 
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Map database vehicles to the TaxiItem format
  const formattedTaxis: TaxiItem[] = vehiclesData.map((vehicle) => {
    return {
      id: vehicle.id,
      name: `${vehicle.make} ${vehicle.model}`,
      type: vehicle.type, // e.g. Sedan, SUV
      location: "Srinagar (Anywhere in Kashmir)", // Default location for taxis
      price: 2500, // Default base price since schema doesn't have pricePerDay
      rating: 4.8,
      reviews: Math.floor(Math.random() * 50) + 10,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800", // Default car image
      featured: false,
      registrationNum: vehicle.registrationNum
    };
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <TaxisClient initialTaxis={formattedTaxis} initialQuery={initialQuery} />
      <Footer />
    </main>
  );
}
