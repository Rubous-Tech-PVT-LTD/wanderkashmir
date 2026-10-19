import React from "react";
import { Metadata } from "next";

import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaysHeroBanner from "@/components/stays/StaysHeroBanner";
import StaysInventoryView from "@/components/stays/StaysInventoryView";
import { StayPropertyItem } from "@/components/stays/StayCard";

export const revalidate = 60; // ISR for stays index

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
  twitter: {
    card: "summary_large_image",
    title: "Hotels, Resorts & Houseboats in Kashmir | WanderKashmir",
    description:
      "Handpicked boutique resorts, Dal Lake houseboats, and alpine stays across Srinagar, Pahalgam, Gulmarg, and Gurez Valley.",
  },
};

export default async function StaysPage() {
  // Fetch complete set of strictly verified & approved properties for public display
  const rawProperties = await prisma.property.findMany({
    where: {
      isApproved: true,
      status: "APPROVED",
    },
    select: {
      id: true,
      name: true,
      location: true,
      description: true,
      pricePerNight: true,
      images: true,
      amenities: true,
      bedrooms: true,
      beds: true,
      guests: true,
      breakfastIncluded: true,
      dinnerIncluded: true,
      propertyType: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform database records into clean, display-ready items
  const properties: StayPropertyItem[] = rawProperties.map((p: (typeof rawProperties)[number]) => ({
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
    vendorType: p.propertyType || "HOTEL",
    propertyType: p.propertyType || "HOTEL",
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--season-background,#FAFAFA)]">
        <StaysHeroBanner />
        <StaysInventoryView initialProperties={properties} />
      </main>
      <Footer />
    </>
  );
}
