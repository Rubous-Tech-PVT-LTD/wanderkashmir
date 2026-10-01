import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToursHeroBanner from "@/components/tours/ToursHeroBanner";
import ToursRecommendationBar from "@/components/tours/ToursRecommendationBar";
import ToursInventoryView from "@/components/tours/ToursInventoryView";
import ToursNeedHelpBanner from "@/components/tours/ToursNeedHelpBanner";
import prisma from "@/lib/prisma";
import { TourPackageDetail, TOUR_CATEGORIES } from "@/data/liveToursData";

// ISR: revalidate every 60 seconds so Admin publish changes are reflected promptly
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kashmir Tour Packages | Curated Itineraries & Mountain Stays | WanderKashmir",
  description:
    "Explore our hand-crafted Kashmir tour packages covering Srinagar, Gulmarg, Pahalgam, and Sonamarg. Private chauffeurs, premium stays, Dal Lake houseboats, and transparent pricing.",
};

interface ToursPageProps {
  searchParams: Promise<{
    category?: string;
    duration?: string;
    destination?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function ToursListingPage({ searchParams }: ToursPageProps) {
  const { category, duration, destination, maxPrice, sort } = await searchParams;

  if (category) {
    const cleanCat = category.toLowerCase().trim();
    if (["culture", "spiritual", "nature", "family", "adventure", "trekking"].includes(cleanCat)) {
      redirect(`/tours/${cleanCat}`);
    }
  }

  const parsedMaxPrice = maxPrice ? Number(maxPrice) : undefined;

  // Fetch ONLY live/published tours from the production database
  let dbTours: TourPackageDetail[] = [];
  try {
    const where: Record<string, unknown> = { isLive: true };

    // Apply category filter at the DB level where possible
    if (category && category !== "all") {
      const categoryEntry = TOUR_CATEGORIES.find(
        (c) => c.slug === category.toLowerCase().trim()
      );
      if (categoryEntry) {
        where.category = categoryEntry.slug;
      }
    }

    const raw = await prisma.tour.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    dbTours = raw.map((tour: (typeof raw)[number]) => ({
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
      category: tour.category || "general",
      categoryDisplay: TOUR_CATEGORIES.find((c) => c.slug === (tour.category || "general"))?.label || tour.category || "General",
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
      isLive: tour.isLive,
      maxPersons: tour.maxPersons || 2,
    }));
  } catch (err) {
    console.error("Failed to fetch tours from production DB on /tours:", err);
    // Return empty — do NOT silently serve static data in production
    dbTours = [];
  }

  // Apply remaining client-side filters (duration, destination, maxPrice, sort)
  // that are not cost-effective to push to every DB query permutation
  let filteredTours = dbTours;

  if (duration) {
    const dur = duration.toLowerCase();
    if (dur.includes("weekend") || dur === "2") {
      filteredTours = filteredTours.filter((t) => t.daysCount <= 2);
    } else if (dur.includes("short") || dur === "3" || dur === "4") {
      filteredTours = filteredTours.filter((t) => t.daysCount >= 3 && t.daysCount <= 4);
    } else if (dur.includes("week") || dur === "5" || dur === "6" || dur === "7") {
      filteredTours = filteredTours.filter((t) => t.daysCount >= 5);
    }
  }

  if (destination) {
    const dest = destination.toLowerCase().trim();
    filteredTours = filteredTours.filter((t) =>
      t.destinations.some((d) => d.toLowerCase().includes(dest))
    );
  }

  if (parsedMaxPrice) {
    filteredTours = filteredTours.filter((t) => t.price <= parsedMaxPrice);
  }

  if (sort) {
    switch (sort) {
      case "price-asc":
        filteredTours.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filteredTours.sort((a, b) => b.price - a.price);
        break;
      case "duration-asc":
        filteredTours.sort((a, b) => a.daysCount - b.daysCount);
        break;
      case "duration-desc":
        filteredTours.sort((a, b) => b.daysCount - a.daysCount);
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text,#1F2937)] transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* 1. COMPACT HERO BANNER */}
        <ToursHeroBanner />

        {/* 2. HELP ME CHOOSE RECOMMENDATION BAR */}
        <ToursRecommendationBar currentCategory={category} />

        {/* 3. TOUR DISCOVERY AREA (Sidebar + Inventory Top Bar + 3-Col Cards Grid) */}
        <ToursInventoryView
          tours={filteredTours}
          category={category}
          duration={duration}
          destination={destination}
          maxPrice={parsedMaxPrice}
          sort={sort}
        />

        {/* 4. NEED HELP CHOOSING? SUPPORT CTA */}
        <ToursNeedHelpBanner />
      </main>

      <Footer />
    </div>
  );
}
