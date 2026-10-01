import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToursHeroBanner from "@/components/tours/ToursHeroBanner";
import ToursRecommendationBar from "@/components/tours/ToursRecommendationBar";
import ToursInventoryView from "@/components/tours/ToursInventoryView";
import ToursNeedHelpBanner from "@/components/tours/ToursNeedHelpBanner";
import prisma from "@/lib/prisma";
import { filterLiveTours } from "@/data/liveToursData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kashmir Tour Packages | Curated Itineraries & Mountain Stays | WanderKashmir",
  description:
    "Explore our 6 hand-crafted Kashmir tour packages covering Srinagar, Gulmarg, Pahalgam, and Sonamarg. Private chauffeurs, premium stays, Dal Lake houseboats, and transparent pricing.",
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

  const filteredTours = filterLiveTours({
    category,
    duration,
    destination,
    maxPrice: parsedMaxPrice,
    sort,
  });

  // Sync real uploaded tour images and pricing from Database
  let syncedTours = filteredTours;
  try {
    const dbTours = await prisma.tour.findMany({
      where: { isLive: true },
      select: { slug: true, images: true, price: true, originalPrice: true },
    });
    const dbTourMap = new Map(dbTours.map((t) => [t.slug, t]));
    syncedTours = filteredTours.map((tour) => {
      const match = dbTourMap.get(tour.slug);
      if (match) {
        const validImages = Array.isArray(match.images)
          ? match.images.filter((img) => typeof img === "string" && img.trim())
          : [];
        return {
          ...tour,
          images: validImages, // Only real uploaded images, else empty (triggers 'Image yet to be assigned')
          price: match.price || tour.price,
          originalPrice: match.originalPrice || tour.originalPrice,
        };
      }
      return {
        ...tour,
        images: [], // No hardcoded fallback
      };
    });
  } catch (err) {
    console.warn("Could not query DB tours on /tours, using fallback:", err);
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
          tours={syncedTours}
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
