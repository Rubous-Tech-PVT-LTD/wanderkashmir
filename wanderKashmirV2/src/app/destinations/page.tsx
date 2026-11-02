import React, { cache } from "react";
import { Metadata } from "next";

import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DestinationsHeroBanner from "@/components/destinations/DestinationsHeroBanner";
import DestinationsInventoryView, { CATEGORY_ALIASES } from "@/components/destinations/DestinationsInventoryView";

// ISR: 1-hour cache for destination catalog. Admin updates trigger on-demand revalidation.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Destinations | Discover Kashmir | WanderKashmir",
  description: "Explore Kashmir's destinations, landscapes and local experiences. Plan your perfect journey through our verified destination guides.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/destinations",
  },
  openGraph: {
    title: "Destinations | Discover Kashmir | WanderKashmir",
    description: "Explore Kashmir's destinations, landscapes and local experiences. Plan your perfect journey through our verified destination guides.",
    url: "https://www.wanderkashmir.com/destinations",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Destinations | Discover Kashmir | WanderKashmir",
    description: "Explore Kashmir's destinations, landscapes and local experiences. Plan your perfect journey through our verified destination guides.",
  },
};

const getDestinationsData = cache(async () => {
  const [rawDestinations, categoryMappings] = await Promise.all([
    prisma.seoLandingPage.findMany({
      where: {
        type: "DESTINATION",
        workflowState: "PUBLISHED"
      },
      select: {
        id: true,
        slug: true,
        type: true,
        title: true,
        h1Heading: true,
        description: true,
        imageUrl: true,
        workflowState: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.systemConfig.findUnique({
      where: { key: "destination_category_mappings" }
    })
  ]);

  const allDestinations = rawDestinations.filter(
    (d) => d.type === "DESTINATION" && d.workflowState === "PUBLISHED"
  );

  let mappings: Record<string, string[]> = {};
  if (categoryMappings?.value) {
    try {
      mappings = JSON.parse(categoryMappings.value);
    } catch (e) {
      console.error("Error parsing category mappings:", e);
    }
  }

  return { allDestinations, mappings };
});

interface DestinationsPageProps {
  searchParams?: Promise<{
    name?: string;
    category?: string;
  }>;
}

export default async function DestinationsPage({ searchParams }: DestinationsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeName = resolvedParams.name ? resolvedParams.name.trim() : undefined;
  const activeCategory = resolvedParams.category ? resolvedParams.category.trim() : undefined;

  const { allDestinations, mappings } = await getDestinationsData();

  // Server-side pre-filtering for SSR and search crawlers
  let filteredDestinations = allDestinations;

  if (activeCategory) {
    const targetCats = CATEGORY_ALIASES[activeCategory] || [activeCategory];
    filteredDestinations = filteredDestinations.filter((dest) => {
      const cats = mappings[dest.slug || ""] || [];
      return cats.some((c) => targetCats.includes(c));
    });
  }

  const normalizedFilter = activeName ? activeName.toLowerCase() : "";
  if (normalizedFilter) {
    filteredDestinations = filteredDestinations.filter((dest) => {
      const slug = (dest.slug || "").toLowerCase();
      const title = (dest.title || "").toLowerCase();
      const heading = (dest.h1Heading || "").toLowerCase();
      return slug === normalizedFilter || title.includes(normalizedFilter) || heading.includes(normalizedFilter);
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text,#111827)] font-sans selection:bg-[var(--season-primary,#EA580C)] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full pb-16 pt-[64px]">
        {/* 1. COMPACT PAGE INTRO */}
        <DestinationsHeroBanner />

        {/* 2. DESTINATION DISCOVERY AREA (Sidebar + Inventory Top Bar + Card Grid) */}
        <DestinationsInventoryView
          allDestinations={allDestinations}
          destinations={filteredDestinations}
          activeName={activeName}
          activeCategory={activeCategory}
          categoryMappings={mappings}
        />
      </main>

      <Footer />
    </div>
  );
}
