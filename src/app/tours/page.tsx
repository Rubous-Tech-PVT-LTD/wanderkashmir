import prisma from "@/lib/prisma";
import ToursClient from "./ToursClient";
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

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
  const dbCategories = await prisma.tourCategory.findMany({
    orderBy: { name: 'asc' }
  });

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
      categoryId: true,
      duration: true,
      destinations: true,
      inclusions: true,
      originalPrice: true,
      price: true,
      createdAt: true
    }
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
      <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <ToursClient initialTours={tours} dbCategories={dbCategories} />
      </Suspense>
      
      {/* Crawlable Tour Directory for SEO */}
      <div className="bg-slate-50 border-t border-slate-100">
        <div className="container-custom py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Complete Kashmir Tour Directory</h2>
            <nav aria-label="Tour Directory">
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {tours.map(tour => tour.isLive && (
                  <li key={tour.id}>
                    <Link 
                      href={`/tours/${tour.slug}`} 
                      className="text-sm text-slate-600 hover:text-orange-500 underline decoration-slate-200 underline-offset-4 transition-colors"
                    >
                      {tour.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
