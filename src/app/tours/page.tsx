import prisma from "@/lib/prisma";
import ToursClient from "./ToursClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Kashmir Tour Packages (2026/2027) | Family, Honeymoon & Adventure Itineraries",
  description: "Explore 100% customizable Kashmir tour packages with local guides, private cabs, houseboats & luxury stays. Best price guaranteed by Indiahiles.",
  keywords: [
    "Kashmir Tour Packages",
    "Srinagar Gulmarg Pahalgam Tour",
    "Kashmir Honeymoon Package",
    "Kashmir Family Holiday",
    "Indiahiles Tours",
    "Kashmir Holiday Itinerary",
    "Kashmir Tour Price"
  ],
  alternates: {
    canonical: "https://www.indiahiles.com/tours",
  },
  openGraph: {
    title: "Best Kashmir Tour Packages | Indiahiles",
    description: "Explore customizable Kashmir tour packages with local guides, private cabs, houseboats & stays. Best price guaranteed.",
    url: "https://www.indiahiles.com/tours",
    siteName: "Indiahiles",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Kashmir Tour Packages | Indiahiles",
    description: "Hand-crafted itineraries by local experts. Everything included — stays, meals, transfers & guides.",
  }
};

export const revalidate = 60;

export default async function ToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 100,
    select: {
      id: true,
      slug: true,
      isLive: true,
      title: true,
      images: true,
      badge: true,
      category: true,
      duration: true,
      destinations: true,
      inclusions: true,
      originalPrice: true,
      price: true,
      createdAt: true
    }
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.indiahiles.com';
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Kashmir Tour Packages",
    "description": "Hand-crafted itineraries by local experts in Kashmir.",
    "url": `${baseUrl}/tours`,
    "numberOfItems": tours.length,
    "itemListElement": tours.map((tour, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/tours/${tour.slug}`,
      "name": tour.title
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToursClient initialTours={tours} />
    </>
  );
}
