import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import HelpMeChoose from "@/components/HelpMeChoose";
import PopularTours from "@/components/PopularTours";
import { PopularTourCard } from "@/types/tours";
import FilterTours from "@/components/FilterTours";
import { FILTER_TOURS_CATALOG, FilterTourPackage } from "@/data/filterToursData";
import BrowseToursSection from "@/components/BrowseToursSection";
import DestinationGuidesAndFAQ, {
  FeaturedDestinationItem,
} from "@/components/DestinationGuidesAndFAQ";
import GoogleReviewsSection from "@/components/GoogleReviewsSection";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";
import { getRealGoogleReviews } from "@/lib/googleReviews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WanderKashmir | Curated Kashmir Tour Packages, Dal Lake Houseboats & Local Stays",
  description:
    "Explore Kashmir with direct local itineraries, heritage houseboats on Dal Lake, boutique alpine stays, and verified mountain drivers managed directly from Srinagar.",
  alternates: {
    canonical: "https://www.wanderkashmir.com",
  },
  openGraph: {
    title: "WanderKashmir | Curated Kashmir Tour Packages, Dal Lake Houseboats & Local Stays",
    description:
      "Explore Kashmir with direct local itineraries, heritage houseboats on Dal Lake, boutique alpine stays, and verified mountain drivers managed directly from Srinagar.",
    url: "https://www.wanderkashmir.com",
    siteName: "WanderKashmir",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.wanderkashmir.com/images/dal-lake-hero.png",
        width: 1200,
        height: 630,
        alt: "WanderKashmir - Curated Kashmir Travel Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WanderKashmir | Curated Kashmir Tour Packages, Dal Lake Houseboats & Local Stays",
    description:
      "Explore Kashmir with direct local itineraries, heritage houseboats on Dal Lake, boutique alpine stays, and verified mountain drivers managed directly from Srinagar.",
  },
};

function getDestinationDisplayName(dest: {
  slug?: string;
  h1Heading?: string | null;
  title?: string | null;
}): string {
  if (dest.slug && dest.slug.trim()) {
    return dest.slug
      .trim()
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  if (dest.h1Heading && dest.h1Heading.trim()) {
    return dest.h1Heading.trim();
  }
  if (dest.title && dest.title.trim()) {
    return dest.title.trim();
  }
  return "Destination";
}

const APPROVED_POPULAR_TOURS_BASE: PopularTourCard[] = [
  {
    id: "tour-7-days-complete",
    title: "Complete Kashmir Experience",
    slug: "7-days-complete-kashmir",
    duration: "7 Days • 6 Nights",
    badge: "Bestseller",
    imageUrl: "",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"],
    rating: 4.8,
    reviewsCount: 412,
    inclusions: [
      { label: "Hotel & Houseboat", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Shikara Ride", type: "houseboat" },
    ],
    price: 23999,
  },
  {
    id: "tour-6-days-explorer",
    title: "Kashmir Explorer Package",
    slug: "6-days-tour-kashmir-explorer-package",
    duration: "6 Days • 5 Nights",
    badge: "Top Rated",
    imageUrl: "",
    destinations: ["Srinagar", "Sonamarg", "Gulmarg", "Pahalgam"],
    rating: 4.8,
    reviewsCount: 320,
    inclusions: [
      { label: "Resort Stay", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Gondola Assist", type: "activities" },
    ],
    price: 18000,
  },
  {
    id: "tour-5-days-family",
    title: "Family Special Package",
    slug: "5-days-family-special",
    duration: "5 Days • 4 Nights",
    badge: "Family Pick",
    imageUrl: "",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    rating: 4.8,
    reviewsCount: 295,
    inclusions: [
      { label: "Family Suites", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Houseboat Stay", type: "houseboat" },
    ],
    price: 13999,
  },
  {
    id: "tour-4-days-first-timer",
    title: "Complete First-Timer",
    slug: "4-days-srinagar-gulmarg-pahalgam",
    duration: "4 Days • 3 Nights",
    badge: "Best Value",
    imageUrl: "",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    rating: 4.8,
    reviewsCount: 412,
    inclusions: [
      { label: "Deluxe Hotel", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Breakfast", type: "meals" },
      { label: "Gondola Tour", type: "activities" },
    ],
    price: 11999,
  },
];

export default async function HomePage() {
  let featuredDestinations: FeaturedDestinationItem[] = [];

  try {
    const rawDestinations = await prisma.seoLandingPage.findMany({
      where: {
        type: "DESTINATION",
        workflowState: "PUBLISHED",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        slug: true,
        title: true,
        h1Heading: true,
        imageUrl: true,
        description: true,
        _count: {
          select: { places: true },
        },
      },
    });

    featuredDestinations = rawDestinations.map((dest: (typeof rawDestinations)[number]) => ({
      id: dest.id,
      name: getDestinationDisplayName(dest),
      slug: dest.slug,
      href: `/destinations/${dest.slug}`,
      imageUrl: dest.imageUrl || "/placeholder-image.jpg",
      placesCount: dest._count?.places || 0,
      subtitle:
        dest._count?.places && dest._count.places > 0
          ? `${dest._count.places} ${dest._count.places === 1 ? "Place" : "Places"}`
          : "Travel Guide",
      description: dest.description,
    }));
  } catch (error) {
    console.error("Failed to fetch featured destinations for Homepage:", error);
  }

  let travelStyles: any[] = [];
  try {
    travelStyles = await prisma.travelStyle.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch travel styles for Homepage:", error);
  }

  // Exactly the 4 approved Popular Tours cards — sync ONLY real uploaded images from DB
  let popularTours: PopularTourCard[] = [...APPROVED_POPULAR_TOURS_BASE];
  let syncedFilterTours: FilterTourPackage[] = [...FILTER_TOURS_CATALOG];
  try {
    const popularSlugs = APPROVED_POPULAR_TOURS_BASE.map((t) => t.slug);
    const filterSlugs = FILTER_TOURS_CATALOG.map((t) => t.slug);
    const allRelevantSlugs = Array.from(new Set([...popularSlugs, ...filterSlugs]));

    const dbTours = await prisma.tour.findMany({
      where: { slug: { in: allRelevantSlugs } },
      select: { slug: true, images: true, price: true },
    });

    popularTours = APPROVED_POPULAR_TOURS_BASE.map((base) => {
      const match = dbTours.find((d: (typeof dbTours)[number]) => d.slug === base.slug);
      const dbImage =
        match && match.images && match.images.length > 0 && match.images[0].trim()
          ? match.images[0].trim()
          : "";
      return {
        ...base,
        imageUrl: dbImage, // ONLY real DB image, otherwise "" ("Image yet to be assigned")
        price: match && match.price ? match.price : base.price,
      };
    });

    syncedFilterTours = FILTER_TOURS_CATALOG.map((base) => {
      const match = dbTours.find((d: (typeof dbTours)[number]) => d.slug === base.slug);
      const dbImage =
        match && match.images && match.images.length > 0 && match.images[0].trim()
          ? match.images[0].trim()
          : "";
      return {
        ...base,
        imageUrl: dbImage, // ONLY real DB image, otherwise "" ("Image yet to be assigned")
        price: match && match.price ? match.price : base.price,
      };
    });
  } catch (error) {
    console.error("Failed to sync tour images from DB:", error);
  }

  // Fetch real Google Place reviews live for WanderKashmir
  const googleReviewsData = await getRealGoogleReviews();

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text)] transition-colors duration-200 overflow-x-clip">
      {/* 1. Nav / Header */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero */}
        <HomeHero
          rating={googleReviewsData?.rating}
          totalReviews={googleReviewsData?.userRatingsTotal}
        />

        {/* 3. Help Me Choose */}
        <HelpMeChoose travelStyles={travelStyles} />

        {/* 4. Popular Kashmir Tours (Live DB Images & Details from Admin Panel) */}
        <PopularTours initialTours={popularTours} />

        {/* 5. Filter Tours (Interactive Filter Section with Live DB Images) */}
        <FilterTours initialTours={syncedFilterTours} />

        {/* 6. Browse by Duration, Travel Style & Local Experts Banner */}
        <BrowseToursSection />

        {/* 7. Featured Destinations, Travel Guides & FAQs */}
        <DestinationGuidesAndFAQ featuredDestinations={featuredDestinations} />

        {/* 8. Verified Google Reviews (Live Real Reviews, new design layout & colors) */}
        <GoogleReviewsSection initialData={googleReviewsData} />
      </main>

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
