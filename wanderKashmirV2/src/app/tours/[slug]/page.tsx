import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourPackageView from "@/components/tours/TourPackageView";
import ToursHeroBanner from "@/components/tours/ToursHeroBanner";
import ToursRecommendationBar from "@/components/tours/ToursRecommendationBar";
import ToursInventoryView from "@/components/tours/ToursInventoryView";
import ToursNeedHelpBanner from "@/components/tours/ToursNeedHelpBanner";
import { getTourFromDB, getOtherToursFromDB, getToursByTravelStyle } from "@/data/toursDataFetching";
import prisma from "@/lib/prisma";

// ISR: revalidate every 60 seconds so Admin publish changes are reflected promptly
export const revalidate = 60;

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
  const tours: { slug: string }[] = await prisma.tour
    .findMany({
      where: { isLive: true },
      select: { slug: true },
    })
    .catch(() => []);
  const styles: { slug: string }[] = await prisma.travelStyle
    .findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    .catch(() => []);
  return [
    ...tours.map((t) => ({ slug: t.slug })),
    ...styles.map((s) => ({ slug: s.slug })),
  ];
}

import { JsonLd } from "@/components/JsonLd";

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
        canonical: `https://www.wanderkashmir.com/tours/${travelStyle.slug}`,
      },
      openGraph: {
        title: `${travelStyle.name} Kashmir Tour Packages | WanderKashmir`,
        description:
          travelStyle.description ||
          `Explore hand-crafted ${travelStyle.name} Kashmir tour packages with local specialists.`,
        url: `https://www.wanderkashmir.com/tours/${travelStyle.slug}`,
        images: travelStyle.imageUrl ? [travelStyle.imageUrl] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${travelStyle.name} Kashmir Tour Packages | WanderKashmir`,
        description:
          travelStyle.description ||
          `Explore hand-crafted ${travelStyle.name} Kashmir tour packages with local specialists.`,
      },
    };
  }

  // 2. Otherwise check if slug matches a Tour Detail page
  const tour = await getTourFromDB(slug);

  if (!tour || !tour.isLive) {
    return {
      title: "Tour Not Found | WanderKashmir",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${tour.title} (${tour.duration}) | WanderKashmir`,
    description: tour.overview,
    alternates: {
      canonical: `https://www.wanderkashmir.com/tours/${slug}`,
    },
    openGraph: {
      title: `${tour.title} - ${tour.duration}`,
      description: tour.overview,
      url: `https://www.wanderkashmir.com/tours/${slug}`,
      images: tour.images && tour.images[0] ? [tour.images[0]] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tour.title} - ${tour.duration}`,
      description: tour.overview,
    },
  };
}

export default async function TourOrStylePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const parsedMaxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;

  // 1. Check if slug matches an active Travel Style
  const travelStyleData = await getToursByTravelStyle(slug, {
    duration: resolvedSearchParams.duration,
    destination: resolvedSearchParams.destination,
    maxPrice: parsedMaxPrice,
    sort: resolvedSearchParams.sort,
  });

  if (travelStyleData) {
    const { style, tours } = travelStyleData;

    const [dbTourCategories, dbTravelStyles] = await Promise.all([
      prisma.tourCategory
        .findMany({
          where: { showInFilter: true },
          orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true, displayOrder: true },
        })
        .catch(() => []),
      prisma.travelStyle
        .findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          select: { id: true, name: true, slug: true },
        })
        .catch(() => []),
    ]);

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
            categories={dbTourCategories}
            travelStyles={dbTravelStyles}
            category={undefined}
            style={style.slug}
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

  // Strict draft tour access protection: draft tours must return 404
  if (!tour || !tour.isLive) {
    notFound();
  }

  const otherTours = await getOtherToursFromDB(slug);

  const tourJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.overview,
    touristType: "Traveler",
    url: `https://www.wanderkashmir.com/tours/${tour.slug}`,
    ...(tour.price
      ? {
          offers: {
            "@type": "Offer",
            price: tour.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: `https://www.wanderkashmir.com/tours/${tour.slug}`,
          },
        }
      : {}),
    provider: {
      "@type": "TravelAgency",
      name: "WanderKashmir",
      url: "https://www.wanderkashmir.com",
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text)] transition-colors duration-200">
      <JsonLd data={tourJsonLd} />
      <Navbar />
      <main className="flex-1">
        <TourPackageView tour={tour} otherTours={otherTours} />
      </main>
      <Footer />
    </div>
  );
}
