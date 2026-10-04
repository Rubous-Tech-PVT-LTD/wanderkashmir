import { redirect } from "next/navigation";
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

interface ToursPageProps {
  searchParams: Promise<{
    category?: string;
    style?: string;
    duration?: string;
    destination?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function ToursListingPage({ searchParams }: ToursPageProps) {
  const { category, style, duration, destination, maxPrice, sort } = await searchParams;

  const parsedMaxPrice = maxPrice ? Number(maxPrice) : undefined;

  // 1. Fetch visible Tour Categories dynamically from database (ordered by displayOrder)
  const dbTourCategories = await prisma.tourCategory
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
    .catch(() => []);

  // 2. Fetch active Travel Styles dynamically from database
  const dbTravelStyles = await prisma.travelStyle
    .findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })
    .catch(() => []);

  // 3. Resolve selected Category and Travel Style filters
  let matchedCategoryId: string | undefined = undefined;
  let activeCategorySlug: string | undefined = undefined;
  let activeStyleSlug: string | undefined = undefined;

  if (style && style !== "all") {
    const cleanStyle = style.toLowerCase().trim();
    const matchedStyle = dbTravelStyles.find((s) => s.slug.toLowerCase() === cleanStyle);
    if (matchedStyle) {
      activeStyleSlug = matchedStyle.slug;
    }
  }

  if (category && category !== "all") {
    const cleanCat = category.toLowerCase().trim();
    const matchedCat = dbTourCategories.find(
      (c) => c.slug.toLowerCase() === cleanCat || c.id === category
    );

    if (matchedCat) {
      matchedCategoryId = matchedCat.id;
      activeCategorySlug = matchedCat.slug;
    } else {
      // Check if it's an admin category that exists in DB (even if not shown in filter)
      const anyCat = await prisma.tourCategory.findFirst({
        where: { OR: [{ slug: cleanCat }, { id: category }] },
        select: { id: true, slug: true },
      });
      if (anyCat) {
        matchedCategoryId = anyCat.id;
        activeCategorySlug = anyCat.slug;
      } else if (!activeStyleSlug && dbTravelStyles.some((s) => s.slug.toLowerCase() === cleanCat)) {
        // Backwards compatibility: if a travel style slug was passed in ?category=
        activeStyleSlug = cleanCat;
      }
    }
  }

  // 4. Fetch ONLY live/published tours from production DB using canonical relational fields
  let dbTours: TourPackageDetail[] = [];
  try {
    const where: Record<string, unknown> = { isLive: true };

    // Canonical relational filtering by Tour.categoryId
    if (matchedCategoryId) {
      where.categoryId = matchedCategoryId;
    }

    // TravelStyle filtering via Many-to-Many relation TourTravelStyle
    if (activeStyleSlug) {
      where.travelStyles = {
        some: {
          travelStyle: {
            slug: activeStyleSlug,
            isActive: true,
          },
        },
      };
    }

    const raw = await prisma.tour.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tourCategory: { select: { id: true, name: true, slug: true } },
      },
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
      category: tour.tourCategory?.name || tour.category || "General",
      categoryDisplay: tour.tourCategory?.name || tour.category || "General",
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
        <ToursRecommendationBar currentCategory={activeStyleSlug || category} />

        {/* 3. TOUR DISCOVERY AREA (Sidebar + Inventory Top Bar + 3-Col Cards Grid) */}
        <ToursInventoryView
          tours={filteredTours}
          categories={dbTourCategories}
          travelStyles={dbTravelStyles}
          category={activeCategorySlug || category}
          style={activeStyleSlug || style}
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
