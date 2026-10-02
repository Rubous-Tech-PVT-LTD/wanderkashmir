import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HotelDetailView from "@/components/stays/detail/HotelDetailView";
import { mapPropertyToHotelViewModel } from "@/components/stays/detail/types";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 60;

interface HotelDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: HotelDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const property = await prisma.property.findFirst({
    where: {
      OR: [
        { id: slug },
        { name: { equals: slug.replace(/-/g, " "), mode: "insensitive" } },
      ],
      isApproved: true,
      status: "APPROVED",
    },
    select: {
      id: true,
      name: true,
      description: true,
      images: true,
      location: true,
    },
  });

  if (!property) {
    return {
      title: "Stay Not Found | WanderKashmir",
      robots: { index: false, follow: false },
    };
  }

  const cleanDesc = property.description
    ? property.description.slice(0, 155)
    : `Explore ${property.name} in ${property.location}. Verified rates and local hospitality with WanderKashmir.`;

  const ogImg =
    Array.isArray(property.images) && property.images.length > 0 && typeof property.images[0] === "string" && property.images[0].startsWith("http")
      ? property.images[0]
      : undefined;

  return {
    title: `${property.name} | Verified Kashmir Stays | WanderKashmir`,
    description: cleanDesc,
    alternates: {
      canonical: `https://www.wanderkashmir.com/stays/${slug}`,
    },
    openGraph: {
      title: `${property.name} | WanderKashmir`,
      description: cleanDesc,
      url: `https://www.wanderkashmir.com/stays/${slug}`,
      images: ogImg ? [ogImg] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.name} | WanderKashmir`,
      description: cleanDesc,
    },
  };
}

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Query database strictly by id or matching name (Zero fake data)
  const property = await prisma.property.findFirst({
    where: {
      OR: [
        { id: slug },
        { name: { equals: slug.replace(/-/g, " "), mode: "insensitive" } },
      ],
      isApproved: true,
      status: "APPROVED",
    },
    include: {
      vendorProfile: {
        select: {
          id: true,
          type: true,
          businessName: true,
          phone: true,
        },
      },
      roomTypes: true,
      reviews: {
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!property) {
    notFound();
  }

  // Map to strongly typed view model
  const hotel = mapPropertyToHotelViewModel(property, slug);

  const ogImg =
    Array.isArray(property.images) && property.images.length > 0 && typeof property.images[0] === "string" && property.images[0].startsWith("http")
      ? property.images[0]
      : undefined;

  const hotelJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: property.description || undefined,
    url: `https://www.wanderkashmir.com/stays/${slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location,
      addressRegion: "Jammu and Kashmir",
      addressCountry: "IN",
    },
    ...(ogImg ? { image: ogImg } : {}),
    ...(property.pricePerNight
      ? { priceRange: `₹${Math.round(property.pricePerNight)}` }
      : {}),
  };

  return (
    <>
      <JsonLd data={hotelJsonLd} />
      <Navbar />
      <main className="min-h-screen bg-[var(--season-background,#FAFAFA)]">
        <HotelDetailView hotel={hotel} slug={slug} />
      </main>
      <Footer />
    </>
  );
}
