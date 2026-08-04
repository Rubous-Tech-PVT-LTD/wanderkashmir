import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaysClient, { PropertyItem } from "@/components/StaysClient";
import prisma from "@/lib/prisma";

import { Metadata } from "next";

import { getValidImageUrl } from "@/lib/imageUtils";

export const metadata: Metadata = {
  title: "Kashmir Hotels & Stays | Indiahiles",
  description: "Find and book the best hotels, homestays, and houseboats in Srinagar, Gulmarg, Pahalgam, and more.",
};

import { getGooglePlaceReviews } from "@/actions/google-reviews";

export const revalidate = 60; // Fetch fresh data every 60 seconds

export default async function StaysPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const initialQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : "";
  // Fetch real properties from the database
  const propertiesData = await prisma.property.findMany({
    where: {
      isApproved: true,
      status: "APPROVED"
    },
    include: {
      vendorProfile: true, // Needed to get the type (Hotel, Homestay, etc)
      reviews: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  // Map database properties to the PropertyItem format expected by StaysClient
  const formattedProperties: PropertyItem[] = await Promise.all(propertiesData.map(async (prop) => {
    const propData: any = prop;
    let imageUrl = getValidImageUrl(propData.images);

    // Capitalize the vendor type nicely (e.g. "HOTEL" -> "Hotel")
    const typeLabel = prop.vendorProfile?.type 
      ? prop.vendorProfile.type.charAt(0).toUpperCase() + prop.vendorProfile.type.slice(1).toLowerCase()
      : "Hotel";

    let rating = 0;
    let reviewsCount = 0;

    if (prop.reviews && prop.reviews.length > 0) {
      const totalRating = prop.reviews.reduce((sum, r) => sum + r.rating, 0);
      rating = totalRating / prop.reviews.length;
      reviewsCount = prop.reviews.length;
    } else if (prop.googlePlaceId) {
      try {
        const googleData = await getGooglePlaceReviews(prop.googlePlaceId);
        if (googleData) {
          rating = googleData.rating || 0;
          reviewsCount = googleData.userRatingsTotal || 0;
        }
      } catch (e) {
        console.error("Failed to fetch google reviews for", prop.name);
      }
    }

    return {
      id: prop.id,
      name: prop.name,
      type: typeLabel,
      location: prop.location,
      price: prop.pricePerNight,
      rating: Number(rating.toFixed(1)),
      reviews: reviewsCount,
      image: imageUrl,
      images: propData.images && propData.images.length > 0 ? propData.images : [imageUrl],
      imageCount: propData.images ? propData.images.length : 1,
      featured: false,
      amenities: propData.amenities || [],
      description: propData.description || "",
    };
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": formattedProperties.slice(0, 10).map((prop, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": prop.type === "Hotel" ? "Hotel" : "LodgingBusiness",
        "url": `https://www.indiahiles.com/stays/${prop.id}`,
        "name": prop.name,
        "image": prop.image
      }
    }))
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <StaysClient initialProperties={formattedProperties} initialQuery={initialQuery} />
      <Footer />
    </main>
  );
}
