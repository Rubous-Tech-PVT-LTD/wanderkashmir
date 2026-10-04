import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToursHeroBanner from "@/components/tours/ToursHeroBanner";
import ToursRecommendationBar from "@/components/tours/ToursRecommendationBar";
import ToursInventoryView from "@/components/tours/ToursInventoryView";
import ToursNeedHelpBanner from "@/components/tours/ToursNeedHelpBanner";
import { getToursByCategory } from "@/data/toursDataFetching";
import prisma from "@/lib/prisma";
import { JsonLd } from "@/components/JsonLd";

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
  const categories = await prisma.tourCategory
    .findMany({
      where: { showInFilter: true },
      select: { slug: true },
    })
    .catch(() => []);

  return categories.map((c: { slug: string }) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = await prisma.tourCategory.findFirst({
    where: { slug, showInFilter: true },
  });

  if (!category) {
    return {
      title: "Category Not Found | WanderKashmir",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} Tour Packages | Curated Itineraries | WanderKashmir`;
  const description =
    category.description ||
    `Explore hand-crafted ${category.name} tour packages in Kashmir with local guides, private chauffeurs, verified stays, and transparent pricing.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.wanderkashmir.com/tours/category/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} Tour Packages | WanderKashmir`,
      description,
      url: `https://www.wanderkashmir.com/tours/category/${category.slug}`,
      siteName: "WanderKashmir",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} Tour Packages | WanderKashmir`,
      description,
    },
  };
}

export default async function TourCategoryDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const parsedMaxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;

  // 1. Fetch category and its LIVE tours (drafts are excluded in data fetching)
  const categoryData = await getToursByCategory(slug, {
    duration: resolvedSearchParams.duration,
    destination: resolvedSearchParams.destination,
    maxPrice: parsedMaxPrice,
    sort: resolvedSearchParams.sort,
  });

  // Strict category check: must exist and have showInFilter = true
  if (!categoryData || !categoryData.category.showInFilter) {
    notFound();
  }

  const { category, tours } = categoryData;

  // 2. Structured Data (Schema.org ItemList for category landing)
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} Tour Packages`,
    description: category.description || `${category.name} Tour Packages in Kashmir`,
    url: `https://www.wanderkashmir.com/tours/category/${category.slug}`,
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.wanderkashmir.com/tours/${tour.slug}`,
      name: tour.title,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text,#1F2937)] transition-colors duration-200">
      <JsonLd data={categoryJsonLd} />
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO BANNER WITH BREADCRUMB & METADATA */}
        <ToursHeroBanner
          title={`${category.name} Tour Packages`}
          description={category.description || undefined}
          categoryName={category.name}
        />

        {/* 2. RECOMMENDATION BAR */}
        <ToursRecommendationBar currentCategory={category.slug} />

        {/* 3. TOUR DISCOVERY AREA (Sidebar + Inventory Top Bar + 3-Col Cards Grid or Empty State) */}
        <ToursInventoryView
          tours={tours}
          category={category.slug}
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
