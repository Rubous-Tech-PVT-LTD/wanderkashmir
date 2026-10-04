import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import HelpMeChoose from "@/components/HelpMeChoose";
import PopularTours from "@/components/PopularTours";
import { PopularTourCard, TourInclusionItem } from "@/types/tours";
import FilterTours from "@/components/FilterTours";
import { FilterTourPackage } from "@/data/filterToursData";
import BrowseToursSection from "@/components/BrowseToursSection";
import DestinationGuidesAndFAQ, {
  FeaturedDestinationItem,
} from "@/components/DestinationGuidesAndFAQ";
import GoogleReviewsSection from "@/components/GoogleReviewsSection";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";
import { getRealGoogleReviews } from "@/lib/googleReviews";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 60;

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

function extractDaysCount(durationStr: string): number {
  if (!durationStr) return 0;
  const dMatch = durationStr.match(/(\d+)\s*d/i);
  if (dMatch && dMatch[1]) {
    return parseInt(dMatch[1], 10);
  }
  const numMatch = durationStr.match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : 0;
}

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

  // Query DB for Live + Popular Tours (Max 4, ordered by popularOrder ASC)
  let popularTours: PopularTourCard[] = [];
  try {
    const rawPopular = await prisma.tour.findMany({
      where: {
        isLive: true,
        isPopular: true,
      },
      orderBy: [
        { popularOrder: "asc" },
        { createdAt: "desc" },
      ],
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        badge: true,
        images: true,
        destinations: true,
        price: true,
        inclusions: true,
      },
    });

    popularTours = rawPopular.map((tour) => {
      const inclusionsList: TourInclusionItem[] = (tour.inclusions || []).slice(0, 4).map((inc) => {
        const lower = inc.toLowerCase();
        let type: TourInclusionItem["type"] = "activities";
        if (lower.includes("hotel") || lower.includes("resort") || lower.includes("stay") || lower.includes("suite")) {
          type = "hotel";
        } else if (lower.includes("cab") || lower.includes("taxi") || lower.includes("transport") || lower.includes("car")) {
          type = "cab";
        } else if (lower.includes("houseboat") || lower.includes("shikara")) {
          type = "houseboat";
        } else if (lower.includes("meal") || lower.includes("breakfast") || lower.includes("dinner") || lower.includes("food")) {
          type = "meals";
        }
        return { label: inc, type };
      });

      return {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        duration: tour.duration,
        badge: tour.badge || "",
        imageUrl: tour.images && tour.images.length > 0 && tour.images[0].trim() ? tour.images[0].trim() : "",
        destinations: (tour.destinations as string[]) || [],
        rating: 4.8,
        reviewsCount: 350,
        inclusions: inclusionsList,
        price: tour.price,
      };
    });
  } catch (error) {
    console.error("Failed to query popular tours from DB:", error);
    popularTours = [];
  }

  // Query DB for Live Tours to power FilterTours & dynamic Browse by Duration
  let liveFilterTours: FilterTourPackage[] = [];
  let liveBrowseDurations: { days: string; toursCount: string; href: string }[] = [];

  try {
    const rawLiveTours = await prisma.tour.findMany({
      where: { isLive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        badge: true,
        images: true,
        destinations: true,
        price: true,
        inclusions: true,
        travelStyles: {
          include: {
            travelStyle: { select: { name: true } },
          },
        },
      },
    });

    liveFilterTours = rawLiveTours.map((tour) => {
      const days = extractDaysCount(tour.duration);
      const inclusionsList = (tour.inclusions || []).slice(0, 4).map((inc) => {
        const lower = inc.toLowerCase();
        let type: "hotel" | "cab" | "houseboat" | "meals" | "activities" = "activities";
        if (lower.includes("hotel") || lower.includes("resort") || lower.includes("stay") || lower.includes("suite")) {
          type = "hotel";
        } else if (lower.includes("cab") || lower.includes("taxi") || lower.includes("transport") || lower.includes("car")) {
          type = "cab";
        } else if (lower.includes("houseboat") || lower.includes("shikara")) {
          type = "houseboat";
        } else if (lower.includes("meal") || lower.includes("breakfast") || lower.includes("dinner") || lower.includes("food")) {
          type = "meals";
        }
        return { label: inc, type };
      });

      return {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        duration: tour.duration,
        daysCount: days,
        nightsCount: Math.max(0, days - 1),
        badge: tour.badge || undefined,
        imageUrl: tour.images && tour.images.length > 0 && tour.images[0].trim() ? tour.images[0].trim() : "",
        route: (tour.destinations as string[]) || [],
        destinations: (tour.destinations as string[]) || [],
        travelStyles: tour.travelStyles.map((ts) => ts.travelStyle.name),
        months: ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        rating: 4.8,
        reviewsCount: 350,
        inclusions: inclusionsList,
        price: tour.price,
      };
    });

    const durationCountsMap = new Map<number, number>();
    for (const tour of rawLiveTours) {
      const days = extractDaysCount(tour.duration);
      if (days > 0) {
        durationCountsMap.set(days, (durationCountsMap.get(days) || 0) + 1);
      }
    }

    liveBrowseDurations = Array.from(durationCountsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([days, count]) => ({
        days: `${days} Days`,
        toursCount: `${count} ${count === 1 ? "Tour" : "Tours"}`,
        href: `/tours?duration=${days}`,
      }));
  } catch (error) {
    console.error("Failed to query live tours for homepage discovery:", error);
  }

  // Fetch real Google Place reviews live for WanderKashmir
  const googleReviewsData = await getRealGoogleReviews();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "WanderKashmir",
    url: "https://www.wanderkashmir.com",
    logo: "https://www.wanderkashmir.com/brand-logo.png",
    description: "Curated Kashmir tour packages, Dal Lake houseboats, boutique alpine stays, and verified mountain drivers.",
    telephone: "+91-6005888754",
    email: "support@wanderkashmir.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Srinagar",
      addressRegion: "Jammu & Kashmir",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/wanderkashmirtravel",
    ],
    ...(googleReviewsData?.rating && googleReviewsData?.userRatingsTotal
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: googleReviewsData.rating,
            reviewCount: googleReviewsData.userRatingsTotal,
          },
        }
      : {}),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text)] transition-colors duration-200 overflow-x-clip">
      <JsonLd data={orgJsonLd} />
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
        <FilterTours initialTours={liveFilterTours} />

        {/* 6. Browse by Duration, Travel Style & Local Experts Banner */}
        <BrowseToursSection durations={liveBrowseDurations} />

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
