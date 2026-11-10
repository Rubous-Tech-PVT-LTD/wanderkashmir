import React, { cache } from "react";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import PlacesInventoryView, {
  PlaceCardItem,
  DestinationFilterItem,
} from "@/components/places/PlacesInventoryView";

// ISR: 1-hour cache. Admin place mutations trigger on-demand revalidation.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Places to Visit in Kashmir | Top Attractions & Heritage Sites | WanderKashmir",
  description:
    "Explore Kashmir’s iconic Mughal gardens, scenic viewpoints, historic shrines, and serene lake spots across Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/places",
  },
  openGraph: {
    title: "Places to Visit in Kashmir | Top Attractions & Heritage Sites | WanderKashmir",
    description:
      "Explore Kashmir’s iconic Mughal gardens, scenic viewpoints, historic shrines, and serene lake spots across Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
    url: "https://www.wanderkashmir.com/places",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Places to Visit in Kashmir | Top Attractions & Heritage Sites | WanderKashmir",
    description:
      "Explore Kashmir’s iconic Mughal gardens, scenic viewpoints, historic shrines, and serene lake spots across Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
  },
};

const getPlacesPageData = cache(async () => {
  const [rawPlaces, publishedDestinations] = await Promise.all([
    prisma.place.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        destination: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        destinationPlaces: {
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            displayOrder: true,
            destination: {
              select: {
                id: true,
                slug: true,
                title: true,
                h1Heading: true,
                workflowState: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.seoLandingPage.findMany({
      where: {
        type: "DESTINATION",
        workflowState: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        h1Heading: true,
      },
      orderBy: { title: "asc" },
    }),
  ]);

  const places: PlaceCardItem[] = rawPlaces.map((p) => {
    // Resolve primary published destination
    const publishedLink = p.destinationPlaces.find(
      (dp) => dp.destination?.workflowState === "PUBLISHED"
    );
    const dest = publishedLink?.destination;

    const destinationName =
      dest?.h1Heading ||
      (dest?.title ? dest.title.split("|")[0].replace(/\s*Travel Guide.*$/i, "").trim() : "") ||
      p.destination ||
      "Kashmir";

    const destinationSlug = dest?.slug || (p.destination ? p.destination.toLowerCase() : "kashmir");

    const canonicalUrl = dest
      ? `/destinations/${dest.slug}/${p.slug}`
      : `/destinations/${destinationSlug}/${p.slug}`;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      imageUrl: p.imageUrl,
      destinationName,
      destinationSlug,
      canonicalUrl,
    };
  });

  const destinations: DestinationFilterItem[] = publishedDestinations
    .map((d) => {
      const cleanName =
        d.h1Heading ||
        (d.title ? d.title.split("|")[0].replace(/\s*Travel Guide.*$/i, "").trim() : d.slug);
      const count = places.filter((p) => p.destinationSlug === d.slug).length;
      return {
        id: d.id,
        slug: d.slug,
        name: cleanName,
        count,
      };
    })
    .filter((d) => d.count > 0);

  return { places, destinations };
});

export default async function PlacesPage() {
  const { places, destinations } = await getPlacesPageData();
  const canonicalOrigin = "https://www.wanderkashmir.com";

  // Schema: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonicalOrigin },
      { "@type": "ListItem", position: 2, name: "Places to Visit", item: `${canonicalOrigin}/places` },
    ],
  };

  // Schema: ItemList for Directory
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Places to Visit in Kashmir",
    description: "Verified tourist attractions, Mughal gardens, viewpoints and heritage sites across Kashmir.",
    url: `${canonicalOrigin}/places`,
    numberOfItems: places.length,
    itemListElement: places.map((place, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: place.name,
      url: `${canonicalOrigin}${place.canonicalUrl}`,
      ...(place.imageUrl && { image: place.imageUrl }),
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      <Navbar />
      <PlacesInventoryView places={places} destinations={destinations} />
      <Footer />
    </>
  );
}

