import prisma from "@/lib/prisma";
import TourDetailClient from "./TourDetailClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tour = await prisma.tour.findUnique({ where: { slug } });
  
  if (!tour) return { title: "Tour Not Found | WanderKashmir" };
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';
  const url = `${baseUrl}/tours/${slug}`;
  const images = tour.images && tour.images.length > 0 ? tour.images : ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80"];
  const description = tour.overview ? `${tour.overview.substring(0, 150)}...` : `Book the ${tour.title} (${tour.duration}) with WanderKashmir. Best price guaranteed.`;

  return {
    title: `${tour.title} (${tour.duration}) | Best Kashmir Tour Package`,
    description,
    keywords: [
      ...tour.destinations,
      "Kashmir Tour Package",
      `${tour.category} Tour Kashmir`,
      "WanderKashmir Tours",
      tour.title,
      "Kashmir Holiday Itinerary"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${tour.title} | WanderKashmir`,
      description,
      url,
      siteName: "WanderKashmir",
      images: images.map(imgUrl => ({ url: imgUrl })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tour.title} | WanderKashmir`,
      description,
      images: [images[0]],
    }
  };
}

export const revalidate = 60;

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!tour) {
    notFound();
  }

  // Calculate rating
  const reviewCount = tour.reviews.length;
  const averageRating = reviewCount > 0 
    ? (tour.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : "0.0";

  // Format reviews for client
  const formattedTour = {
    ...tour,
    rating: averageRating,
    reviews: reviewCount,
    reviewsList: tour.reviews.map(r => ({
      name: r.user?.name || "Anonymous",
      avatar: r.user?.image || "https://ui-avatars.com/api/?name=" + (r.user?.name || "A"),
      location: "India", // Placeholder as location isn't in User model
      date: r.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      rating: r.rating,
      text: r.comment || ""
    }))
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';
  const itineraryList = Array.isArray(tour.itinerary) ? (tour.itinerary as any[]).map((day: any, idx: number) => ({
    "@type": "TouristAttraction",
    "name": `Day ${idx + 1}: ${day.title || day.day || "Kashmir Tour"}`,
    "description": day.desc || day.description || ""
  })) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Product", "TouristTrip"],
        "name": tour.title,
        "description": tour.overview || `Experience ${tour.title} with WanderKashmir.`,
        "image": tour.images && tour.images.length > 0 ? tour.images : ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80"],
        "touristType": [tour.category, "Leisure", "Family", "Adventure"],
        "url": `${baseUrl}/tours/${slug}`,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": tour.price,
          "availability": "https://schema.org/InStock",
          "url": `${baseUrl}/tours/${slug}`
        },
        "provider": {
          "@type": "TravelAgency",
          "name": "WanderKashmir",
          "url": baseUrl
        },
        ...(itineraryList.length > 0 && { "itinerary": itineraryList }),
        ...(reviewCount > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": averageRating,
            "reviewCount": reviewCount
          },
          "review": tour.reviews.map((r: any) => ({
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": r.user?.name || "Anonymous"
            },
            "datePublished": r.createdAt.toISOString().split('T')[0],
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": r.rating,
              "bestRating": "5",
              "worstRating": "1"
            },
            "reviewBody": r.comment || ""
          }))
        })
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TourDetailClient initialTour={formattedTour} />
    </>
  );
}
