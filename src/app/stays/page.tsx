import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaysClient, { PropertyItem } from "@/components/StaysClient";
import prisma from "@/lib/prisma";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kashmir Hotels & Stays | WanderKashmir",
  description: "Find and book the best hotels, homestays, and houseboats in Srinagar, Gulmarg, Pahalgam, and more.",
};

export const revalidate = 60; // Fetch fresh data every 60 seconds

export default async function StaysPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const initialQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : "";
  // Fetch real properties from the database
  const propertiesData = await prisma.property.findMany({
    include: {
      vendorProfile: true, // Needed to get the type (Hotel, Homestay, etc)
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Map database properties to the PropertyItem format expected by StaysClient
  const formattedProperties: PropertyItem[] = propertiesData.map((prop) => {
    // Determine the main image
    let imageUrl = "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800"; // fallback
    const propData: any = prop;
    if (propData.images && propData.images.length > 0) {
      imageUrl = propData.images[0];
    }

    // Capitalize the vendor type nicely (e.g. "HOTEL" -> "Hotel")
    const typeLabel = prop.vendorProfile?.type 
      ? prop.vendorProfile.type.charAt(0).toUpperCase() + prop.vendorProfile.type.slice(1).toLowerCase()
      : "Hotel";

    return {
      id: prop.id,
      name: prop.name,
      type: typeLabel,
      location: prop.location,
      price: prop.pricePerNight,
      rating: 4.5, // Default rating for now
      reviews: Math.floor(Math.random() * 50) + 10, // Random reviews between 10 and 60
      image: imageUrl,
      featured: false,
    };
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <StaysClient initialProperties={formattedProperties} initialQuery={initialQuery} />
      <Footer />
    </main>
  );
}
