import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToursHeroBanner from "@/components/tours/ToursHeroBanner";
import ToursRecommendationBar from "@/components/tours/ToursRecommendationBar";
import ToursInventoryView from "@/components/tours/ToursInventoryView";
import ToursNeedHelpBanner from "@/components/tours/ToursNeedHelpBanner";
import prisma from "@/lib/prisma";
import { TourPackageDetail } from "@/data/liveToursData";

// ISR: revalidate every 60 seconds so Admin publish changes are reflected promptly
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kashmir Tour Packages | Curated Itineraries & Mountain Stays | WanderKashmir",
  description:
    "Explore our hand-crafted Kashmir tour packages covering Srinagar, Gulmarg, Pahalgam, and Sonamarg. Private chauffeurs, premium stays, Dal Lake houseboats, and transparent pricing.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/tours",
  },
  openGraph: {
    title: "Kashmir Tour Packages | WanderKashmir",
    description:
      "Explore our hand-crafted Kashmir tour packages covering Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
    url: "https://www.wanderkashmir.com/tours",
    siteName: "WanderKashmir",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kashmir Tour Packages | WanderKashmir",
    description:
      "Explore our hand-crafted Kashmir tour packages covering Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
  },
};

export default async function ToursListingPage() {
  // 1. Fetch live/published tours, visible Tour Categories, and active Travel Styles concurrently in parallel
  const [rawTours, dbTourCategories, dbTravelStyles] = await Promise.all([
    prisma.tour
      .findMany({
        where: { isLive: true },
        orderBy: { createdAt: "desc" },
        include: {
          tourCategory: { select: { id: true, name: true, slug: true } },
          travelStyles: {
            select: {
              travelStyle: {
                select: { id: true, name: true, slug: true, isActive: true },
              },
            },
          },
        },
      })
      .catch((err) => {
        console.error("Failed to fetch tours from production DB on /tours:", err);
        return [];
      }),

    prisma.tourCategory
      .findMany({
        where: { showInFilter: true },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          displayOrder: true,
        },
      })
      .catch(() => []),

    prisma.travelStyle
      .findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      })
      .catch(() => []),
  ]);

  // 2. Map database records to TourPackageDetail format
  const dbTours: TourPackageDetail[] = rawTours.map((tour: (typeof rawTours)[number]) => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    duration: tour.duration || "",
    daysCount: parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "0", 10),
    nightsCount: Math.max(
      0,
      parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "1", 10) - 1
    ),
    badge: (tour as any).badge || "",
    category: tour.tourCategory?.name || tour.category || "General",
    categoryDisplay: tour.tourCategory?.name || tour.category || "General",
    categoryId: tour.categoryId || tour.tourCategory?.id || null,
    tourCategory: tour.tourCategory || null,
    destinations: (tour.destinations as string[]) || [],
    routeDisplay: (tour.destinations as string[]) || [],
    price: tour.price || 0,
    originalPrice: tour.originalPrice || tour.price || 0,
    rating: 0,
    reviewsCount: 0,
    overview: tour.overview || "",
    images: (tour.images as string[]) || [],
    whyThisRoute: [],
    itinerary: [],
    inclusions: (tour.inclusions as string[]) || [],
    exclusions: (tour.exclusions as string[]) || [],
    highlights: (tour.highlights as string[]) || [],
    reviewsList: [],
    stays: [],
    transports: [],
    travelStyles: (tour.travelStyles as any[]) || [],
    isLive: tour.isLive,
    maxPersons: tour.maxPersons || 2,
  }));

  // 3. Derive catalog filter metadata from rawTours
  const durationCountsMap = new Map<number, number>();
  const destSet = new Set<string>();
  const prices: number[] = [];

  for (const t of rawTours) {
    const days = parseInt(
      (t.duration || "0").match(/(\d+)\s*d/i)?.[1] ||
        (t.duration || "0").match(/\d+/)?.[0] ||
        "0",
      10
    );
    if (days > 0) {
      durationCountsMap.set(days, (durationCountsMap.get(days) || 0) + 1);
    }
    if (Array.isArray(t.destinations)) {
      for (const d of t.destinations) {
        const clean = d?.trim();
        if (clean) destSet.add(clean);
      }
    }
    if (typeof t.price === "number" && !isNaN(t.price) && t.price > 0) {
      prices.push(t.price);
    }
  }

  const availableDurations = Array.from(durationCountsMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([days, count]) => ({
      value: String(days),
      label: `${days} Days`,
      count,
    }));

  const availableDestinations = Array.from(destSet)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, label: name }));

  let minPriceBound = 0;
  let maxPriceBound = 50000;
  if (prices.length > 0) {
    minPriceBound = Math.min(...prices);
    maxPriceBound = Math.ceil(Math.max(...prices) / 1000) * 1000;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text,#1F2937)] transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* 1. COMPACT HERO BANNER */}
        <ToursHeroBanner />

        {/* 2. HELP ME CHOOSE RECOMMENDATION BAR */}
        <ToursRecommendationBar />

        {/* 3. TOUR DISCOVERY AREA (Sidebar + Inventory Top Bar + 3-Col Cards Grid) */}
        <ToursInventoryView
          tours={dbTours}
          categories={dbTourCategories}
          travelStyles={dbTravelStyles}
          minPriceBound={minPriceBound}
          maxPriceBound={maxPriceBound}
          availableDurations={availableDurations}
          availableDestinations={availableDestinations}
        />

        {/* 4. NEED HELP CHOOSING? SUPPORT CTA */}
        <ToursNeedHelpBanner />
      </main>

      <Footer />
    </div>
  );
}
