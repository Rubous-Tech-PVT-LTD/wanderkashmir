import React from "react";
import { Metadata } from "next";

import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaysHeroBanner from "@/components/stays/StaysHeroBanner";
import StaysInventoryView from "@/components/stays/StaysInventoryView";
import { StayPropertyItem } from "@/components/stays/StayCard";

export const revalidate = 3600; // ISR for stays index

export const metadata: Metadata = {
  title: "Hotels, Resorts & Houseboats in Kashmir | WanderKashmir",
  description:
    "Book verified hotels, alpine resorts, Dal Lake houseboats, and village homestays in Kashmir. Handpicked local stays with transparent rates and warm Kashmiri hospitality.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/stays",
  },
  openGraph: {
    title: "Hotels, Resorts & Houseboats in Kashmir | WanderKashmir",
    description:
      "Handpicked boutique resorts, Dal Lake houseboats, and alpine stays across Srinagar, Pahalgam, Gulmarg, and Gurez Valley.",
    url: "https://www.wanderkashmir.com/stays",
    siteName: "WanderKashmir",
    locale: "en_US",
    type: "website",
  },
};

interface StaysPageProps {
  searchParams?: Promise<{
    type?: string;
    location?: string;
    maxPrice?: string;
  }>;
}

export default async function StaysPage({ searchParams }: StaysPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeType = resolvedParams.type ? resolvedParams.type.trim() : undefined;
  const activeLocation = resolvedParams.location ? resolvedParams.location.trim() : undefined;
  const activeMaxPrice = resolvedParams.maxPrice ? parseInt(resolvedParams.maxPrice.trim(), 10) : undefined;

  // Fetch strictly verified & approved properties from database
  const rawProperties = await prisma.property.findMany({
    where: {
      isApproved: true,
      status: "APPROVED",
    },
    include: {
      vendorProfile: {
        select: {
          id: true,
          type: true,
          businessName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform database records into clean, display-ready items
  const properties: StayPropertyItem[] = rawProperties.map((p) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    description: p.description,
    pricePerNight: Math.round(p.pricePerNight),
    images: Array.isArray(p.images) ? p.images : [],
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    bedrooms: p.bedrooms || 1,
    beds: p.beds || 1,
    guests: p.guests || 2,
    breakfastIncluded: Boolean(p.breakfastIncluded),
    dinnerIncluded: Boolean(p.dinnerIncluded),
    vendorType: p.vendorProfile?.type || "HOTEL",
    propertyType: p.propertyType || "HOTEL",
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--season-background,#FAFAFA)]">
        <StaysHeroBanner />
        <StaysInventoryView
          initialProperties={properties}
          initialType={activeType}
          initialLocation={activeLocation}
          initialMaxPrice={activeMaxPrice}
        />
      </main>
      <Footer />
    </>
  );
}
