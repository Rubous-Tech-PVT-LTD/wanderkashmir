import React from "react";
import { Metadata } from "next";

import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DestinationsHeroBanner from "@/components/destinations/DestinationsHeroBanner";
import DestinationsInventoryView from "@/components/destinations/DestinationsInventoryView";


export const revalidate = 3600; // ISR for destination index

export const metadata: Metadata = {
  title: "Destinations | Discover Kashmir | WanderKashmir",
  description: "Explore Kashmir's destinations, landscapes and local experiences. Plan your perfect journey through our verified destination guides.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/destinations",
  },
};

interface DestinationsPageProps {
  searchParams: Promise<{
    name?: string;
    category?: string;
  }>;
}

export default async function DestinationsPage({ searchParams }: DestinationsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeName = resolvedParams.name ? resolvedParams.name.trim() : undefined;
  const activeCategory = resolvedParams.category ? resolvedParams.category.trim() : undefined;

  // 1. Fetch ONLY destination pages strictly restricted to type: "DESTINATION" and workflowState: "PUBLISHED"
  // Use explicit select to retrieve only the lightweight fields needed for card display and filtering
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

  // 2. Defensive server-side validation: Guarantee strictly DESTINATION type and PUBLISHED status
  const allDestinations = rawDestinations.filter(
    (d) => d.type === "DESTINATION" && d.workflowState === "PUBLISHED"
  );

  const mappings = categoryMappings?.value ? JSON.parse(categoryMappings.value) : {};

  // 3. Filter in-memory by category and destination name
  let filteredDestinations = allDestinations;

  if (activeCategory) {
    filteredDestinations = filteredDestinations.filter(dest => {
      const cats = mappings[dest.slug || ""] || [];
      return cats.includes(activeCategory);
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
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text)] font-sans selection:bg-[var(--season-primary)] selection:text-white">
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
        />


      </main>

      <Footer />
    </div>
  );
}
