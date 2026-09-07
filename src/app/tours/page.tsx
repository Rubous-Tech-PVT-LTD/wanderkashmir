import prisma from "@/lib/prisma";
import ToursClient from "./ToursClient";
import TourCard from "@/components/TourCard";
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CustomizeTourModal = dynamic(() => import("@/components/CustomizeTourModal"));

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

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default async function ToursPage() {
  const getCachedCategories = unstable_cache(
    async () => {
      return await prisma.tourCategory.findMany({
        orderBy: { name: 'asc' }
      });
    },
    ['tour-categories'],
    { revalidate: 60, tags: ['tour-categories'] }
  );
  
  const dbCategories = await getCachedCategories();

  const getCachedTours = unstable_cache(
    async () => {
      const dbTours = await prisma.tour.findMany({
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
        }
      });
      
      return dbTours.map(t => ({
        id: t.id,
        slug: t.slug,
        isLive: t.isLive,
        title: t.title,
        image: t.images[0] || null,
        badge: t.badge,
        category: t.category,
        duration: t.duration,
        destinations: t.destinations,
        inclusions: t.inclusions,
        originalPrice: t.originalPrice,
        price: t.price,
      }));
    },
    ['tours-list'],
    { revalidate: 60, tags: ['tours'] }
  );

  const tours = await getCachedTours();

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

  // Move Filter Option Generation to the Server
  const usedCategories = new Set<string>();
  const usedMonths = new Set<string>();
  const usedDestinations = new Set<string>();
  
  tours.forEach((tour: any) => {
    if (tour.category) {
      tour.category.split(',').forEach((c: string) => {
        const trimmed = c.trim();
        if (trimmed) {
          if (MONTHS.includes(trimmed)) {
            usedMonths.add(trimmed);
          } else {
            usedCategories.add(trimmed);
          }
        }
      });
    }
    if (tour.destinations && Array.isArray(tour.destinations)) {
      tour.destinations.forEach((d: string) => {
        const trimmed = d.trim();
        if (trimmed) usedDestinations.add(trimmed);
      });
    }
  });

  const baseCategories = dbCategories.length > 0 
    ? dbCategories.map(c => c.name).filter(c => !MONTHS.includes(c))
    : ["Upcoming", "Honeymoon", "Family", "Adventure", "Pilgrimage", "Culture"];
  
  const precomputedCategories = ["All Packages", ...Array.from(new Set([...baseCategories, ...Array.from(usedCategories)]))];
  const sortedUsedMonths = Array.from(usedMonths).sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b));
  const precomputedMonths = ["All Months", ...sortedUsedMonths];
  const precomputedDestinations = ["All Destinations", ...Array.from(usedDestinations).sort()];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Navbar />
        <div className="pt-20 min-h-screen">
          {/* Header */}
          <div className="relative py-24 overflow-hidden">
            <Image
              src="/tours-hero.webp"
              alt="Tour Packages in Kashmir"
              fill
              priority
              fetchPriority="high"
              className="object-cover z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40 z-0"></div>
            <div className="container-custom text-center text-white relative z-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-100 mb-3">
                Curated Experiences
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 text-white">
                Tour Packages in Kashmir
              </h1>
              <p className="text-orange-50 text-base max-w-xl mx-auto mb-6">
                Hand-crafted itineraries by local experts. Everything included — stays, meals, transfers & guides.
              </p>
              <div className="flex justify-center">
                <CustomizeTourModal />
              </div>
            </div>
          </div>

          <ToursClient 
            metadata={tours.map((t: any) => ({ id: t.id, category: t.category, destinations: t.destinations }))}
            cards={tours.map((t: any) => ({ id: t.id, node: <TourCard key={t.id} tour={t} /> }))}
            precomputedCategories={precomputedCategories} 
            precomputedMonths={precomputedMonths} 
            precomputedDestinations={precomputedDestinations} 
          />
        </div>
        
        {/* Crawlable Tour Directory for SEO */}
        <div className="bg-slate-50 border-t border-slate-100">
          <div className="container-custom py-12">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xl font-bold mb-6 text-slate-800">Complete Kashmir Tour Directory</h2>
              <nav aria-label="Tour Directory">
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {tours.map((tour: any) => tour.isLive && (
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
        <Footer />
      </main>
    </>
  );
}
