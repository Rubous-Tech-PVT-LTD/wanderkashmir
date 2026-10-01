import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourPackageView from "@/components/tours/TourPackageView";
import ToursHeroBanner from "@/components/tours/ToursHeroBanner";
import ToursRecommendationBar from "@/components/tours/ToursRecommendationBar";
import ToursInventoryView from "@/components/tours/ToursInventoryView";
import ToursNeedHelpBanner from "@/components/tours/ToursNeedHelpBanner";
import { LIVE_TOURS_CATALOG } from "@/data/liveToursData";
import { getTourFromDB, getOtherToursFromDB, getToursByTravelStyle } from "@/data/toursDataFetching";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    duration?: string;
    destination?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export async function generateStaticParams() {
  const tours = await prisma.tour.findMany({
    where: { isLive: true },
    select: { slug: true },
  }).catch(() => []);
  const styles = await prisma.travelStyle.findMany({
    where: { isActive: true },
    select: { slug: true },
  }).catch(() => []);
  return [
    ...LIVE_TOURS_CATALOG.map((tour) => ({
      slug: tour.slug,
    })),
    ...tours.map((t) => ({ slug: t.slug })),
    ...styles.map((s) => ({ slug: s.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Check if slug matches an active Travel Style
  const travelStyle = await prisma.travelStyle.findFirst({
    where: { slug, isActive: true },
  });

  if (travelStyle) {
    return {
      title: `${travelStyle.name} Kashmir Tour Packages | Curated Itineraries | WanderKashmir`,
      description:
        travelStyle.description ||
        `Explore hand-crafted ${travelStyle.name} Kashmir tour packages with local guides, private chauffeurs, verified stays, and transparent pricing.`,
      alternates: {
        canonical: `/tours/${travelStyle.slug}`,
      },
      openGraph: {
        title: `${travelStyle.name} Kashmir Tour Packages | WanderKashmir`,
        description:
          travelStyle.description ||
          `Explore hand-crafted ${travelStyle.name} Kashmir tour packages with local specialists.`,
        images: travelStyle.imageUrl ? [travelStyle.imageUrl] : [],
      },
    };
  }

  // 2. Otherwise check if slug matches a Tour Detail page
  const tour = await getTourFromDB(slug);

  if (!tour) {
    return {
      title: "Tour Not Found | WanderKashmir",
    };
  }

  return {
    title: `${tour.title} (${tour.duration}) | WanderKashmir`,
    description: tour.overview,
    alternates: {
      canonical: `/tours/${slug}`,
    },
    openGraph: {
      title: `${tour.title} - ${tour.duration}`,
      description: tour.overview,
      images: tour.images && tour.images[0] ? [tour.images[0]] : [],
    },
  };
}

export default async function TourOrStylePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const parsedMaxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;

  console.log("=== [DEBUG] TourOrStylePage requested slug:", slug);

  // 1. Check if slug matches an active Travel Style
  const travelStyleData = await getToursByTravelStyle(slug, {
    duration: resolvedSearchParams.duration,
    destination: resolvedSearchParams.destination,
    maxPrice: parsedMaxPrice,
    sort: resolvedSearchParams.sort,
  });

  if (travelStyleData) {
    const { style, tours } = travelStyleData;
    return (
      <div className="flex min-h-screen flex-col bg-white text-[var(--season-text,#1F2937)] transition-colors duration-200">
        <Navbar />

        <main className="flex-1">
          {/* 1. COMPACT HERO BANNER */}
          <ToursHeroBanner
            title={`${style.name} Kashmir Tours`}
            description={style.description || undefined}
            travelStyleName={style.name}
          />

          {/* 2. HELP ME CHOOSE RECOMMENDATION BAR */}
          <ToursRecommendationBar currentCategory={style.slug} />

          {/* 3. TOUR DISCOVERY AREA (Sidebar + Inventory Top Bar + 3-Col Cards Grid or Empty State) */}
          <ToursInventoryView
            tours={tours}
            category={style.slug}
            duration={resolvedSearchParams.duration}
            destination={resolvedSearchParams.destination}
            maxPrice={parsedMaxPrice}
            sort={resolvedSearchParams.sort}
          />

          {/* 4. NEED HELP CHOOSING? SUPPORT CTA */}
          <ToursNeedHelpBanner />
        </main>

        <Footer />
      </div>
    );
  }

  // 2. Otherwise check if slug matches a Tour Detail page
  const tour = await getTourFromDB(slug);

  if (!tour) {
    notFound();
  }

  const otherTours = await getOtherToursFromDB(slug);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text)] transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <TourPackageView tour={tour} otherTours={otherTours} />
      </main>
      <Footer />
    </div>
  );
}
