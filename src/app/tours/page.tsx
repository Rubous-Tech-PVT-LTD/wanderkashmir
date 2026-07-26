import prisma from "@/lib/prisma";
import ToursClient from "./ToursClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Kashmir Tour Packages (2026/2027) | Family, Honeymoon & Adventure Itineraries",
  description: "Explore 100% customizable Kashmir tour packages with local guides, private cabs, houseboats & luxury stays. Best price guaranteed by WanderKashmir.",
  keywords: [
    "Kashmir Tour Packages",
    "Srinagar Gulmarg Pahalgam Tour",
    "Kashmir Honeymoon Package",
    "Kashmir Family Holiday",
    "WanderKashmir Tours",
    "Kashmir Holiday Itinerary",
    "Kashmir Tour Price"
  ],
  alternates: {
    canonical: "https://www.wanderkashmir.com/tours",
  },
  openGraph: {
    title: "Best Kashmir Tour Packages | WanderKashmir",
    description: "Explore customizable Kashmir tour packages with local guides, private cabs, houseboats & stays. Best price guaranteed.",
    url: "https://www.wanderkashmir.com/tours",
    siteName: "WanderKashmir",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Kashmir Tour Packages | WanderKashmir",
    description: "Hand-crafted itineraries by local experts. Everything included — stays, meals, transfers & guides.",
  }
};

export const revalidate = 60;

export default async function ToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';
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
