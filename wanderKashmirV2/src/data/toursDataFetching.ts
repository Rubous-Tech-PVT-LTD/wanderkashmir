import prisma from "../lib/prisma";
import { TourPackageDetail, LIVE_TOURS_CATALOG } from "./liveToursData";
import { cache } from "react";

export const getTourFromDB = cache(async function(slug: string): Promise<TourPackageDetail | null> {
  try {
    const tour = await prisma.tour.findUnique({
      where: { slug },
      include: {
        stays: true,
        transports: { include: { vehicle: true, driver: true } },
        experiences: { include: { experience: true } },
        reviews: { include: { user: { select: { name: true } } } },
        travelGuides: {
          include: {
            guide: true,
          },
          orderBy: { displayOrder: "asc" },
        },
      }
    });

    if (!tour) return null;

    // Batch resolve destinations against published SeoLandingPage (type = "DESTINATION")
    let resolvedDestinations: { name: string; slug?: string; hasPublicPage: boolean }[] = [];
    if (Array.isArray(tour.destinations) && tour.destinations.length > 0) {
      try {
        const destPages = await prisma.seoLandingPage.findMany({
          where: {
            type: "DESTINATION",
            workflowState: "PUBLISHED",
          },
          select: { slug: true, title: true, h1Heading: true },
        });

        resolvedDestinations = tour.destinations.map((dName: string) => {
          const cleanName = dName.trim();
          const norm = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const matched = destPages.find((p) => {
            const pSlug = p.slug.toLowerCase();
            const pTitle = p.title.toLowerCase();
            return pSlug === norm || pSlug === `destinations-${norm}` || pTitle.includes(cleanName.toLowerCase());
          });

          if (matched) {
            return {
              name: cleanName,
              slug: matched.slug,
              hasPublicPage: true,
            };
          }
          return {
            name: cleanName,
            hasPublicPage: false,
          };
        });
      } catch (destErr) {
        console.warn("Could not query destination SEO pages, using unlinked destinations:", destErr);
        resolvedDestinations = tour.destinations.map((dName: string) => ({
          name: dName.trim(),
          hasPublicPage: false,
        }));
      }
    }

    // Filter and map travel guides for valid, published BLOG pages only
    const travelGuides = (tour.travelGuides || [])
      .filter((tg) => tg.guide && tg.guide.type === "BLOG" && tg.guide.workflowState === "PUBLISHED")
      .map((tg) => ({
        id: tg.id,
        guideId: tg.guideId,
        title: tg.guide.title,
        slug: tg.guide.slug,
        imageUrl: tg.guide.imageUrl,
        description: tg.guide.description,
        displayOrder: tg.displayOrder,
      }));

    return {
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      duration: tour.duration || "",
      daysCount: parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "0", 10),
      nightsCount: Math.max(0, parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "1", 10) - 1),
      category: tour.category || "general",
      destinations: tour.destinations || [],
      routeDisplay: tour.destinations || [],
      resolvedDestinations,
      price: tour.price || 0,
      originalPrice: tour.originalPrice || tour.price || 0,
      rating: tour.reviews?.length ? tour.reviews.reduce((acc, r) => acc + r.rating, 0) / tour.reviews.length : 0,
      reviewsCount: tour.reviews?.length || 0,
      overview: tour.overview || "",
      images: tour.images || [],
      whyThisRoute: [],
      itinerary: Array.isArray(tour.itinerary)
        ? (tour.itinerary as any[]).map((item, idx) => ({
            day: item.day ?? item.dayNumber ?? (idx + 1),
            title: item.title || `Day ${item.day ?? item.dayNumber ?? (idx + 1)}`,
            desc: item.desc || item.description || "",
            activities: Array.isArray(item.activities)
              ? item.activities
              : typeof item.activities === "string" && item.activities
              ? [item.activities]
              : [],
            location: item.location || item.destination || undefined,
            stay: item.stay || item.overnight || undefined,
            meals: item.meals || undefined,
            image: item.image || item.imageUrl || undefined,
          }))
        : [],
      inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [],
      highlights: tour.highlights || [],
      reviewsList: tour.reviews?.map(r => ({
        name: r.user?.name || "Traveler",
        avatar: "",
        location: "", // The user instructed to hide the fallback reviewer location if unavailable
        date: r.createdAt.toISOString(),
        rating: r.rating,
        text: r.comment || "",
      })) || [],
      stays: tour.stays?.map(s => ({
        id: s.id,
        destination: s.destination,
        nights: s.nights,
        stayType: s.stayType || undefined,
        displayOrder: s.displayOrder,
        propertyId: s.propertyId,
      })) || [],
      transports: tour.transports?.map(t => ({
        id: t.id,
        origin: t.origin,
        destination: t.destination,
        purpose: t.purpose,
        displayOrder: t.displayOrder,
        vehicleId: t.vehicleId,
        driverId: t.driverId,
      })) || [],
      experiences: tour.experiences?.map(te => ({
        id: te.id,
        experienceId: te.experienceId,
        title: te.experience.title,
        description: te.experience.description,
        destination: te.experience.destination,
        duration: te.experience.duration,
        basePrice: te.experience.basePrice,
        status: te.experience.status,
        isOptional: te.isOptional,
        dayNumber: te.dayNumber,
        displayOrder: te.displayOrder,
      })) || [],
      travelGuides,
      isLive: tour.isLive,
      maxPersons: tour.maxPersons || 2,
      badge: "",
    };
  } catch (error) {
    console.error("DB Connection failed for Tour detail:", slug, error);
    // Return null — do NOT silently serve static catalog data in production
    return null;
  }
});

export const getOtherToursFromDB = cache(async function(excludeSlug: string): Promise<TourPackageDetail[]> {
  try {
    const tours = await prisma.tour.findMany({
      where: { isLive: true, slug: { not: excludeSlug } },
      take: 4,
    });

    return tours.map(tour => ({
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      duration: tour.duration || "",
      daysCount: parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "0", 10),
      nightsCount: Math.max(0, parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "1", 10) - 1),
      category: tour.category || "general",
      destinations: tour.destinations || [],
      routeDisplay: tour.destinations || [],
      price: tour.price || 0,
      originalPrice: tour.originalPrice || tour.price || 0,
      rating: 0,
      reviewsCount: 0,
      overview: tour.overview || "",
      images: tour.images || [],
      whyThisRoute: [],
      itinerary: Array.isArray(tour.itinerary)
        ? (tour.itinerary as any[]).map((item, idx) => ({
            day: item.day ?? item.dayNumber ?? (idx + 1),
            title: item.title || `Day ${item.day ?? item.dayNumber ?? (idx + 1)}`,
            desc: item.desc || item.description || "",
            activities: Array.isArray(item.activities) ? item.activities : [],
            location: item.location || item.destination || undefined,
            stay: item.stay || item.overnight || undefined,
            meals: item.meals || undefined,
            image: item.image || item.imageUrl || undefined,
          }))
        : [],
      inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [],
      highlights: tour.highlights || [],
      reviewsList: [],
      stays: [],
      transports: [],
      isLive: tour.isLive,
      maxPersons: tour.maxPersons || 2,
    }));
  } catch (error) {
    console.error("DB Connection failed for Other Tours (excluding:", excludeSlug, "):", error);
    // Return empty — do NOT silently serve static catalog data in production
    return [];
  }
});

export interface TravelStyleListingData {
  style: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    isActive: boolean;
    displayOrder: number;
  };
  tours: TourPackageDetail[];
}

export const getToursByTravelStyle = cache(async function(
  styleSlug: string,
  filters?: {
    duration?: string;
    destination?: string;
    maxPrice?: number;
    sort?: string;
  }
): Promise<TravelStyleListingData | null> {
  try {
    const travelStyle = await prisma.travelStyle.findFirst({
      where: { slug: styleSlug, isActive: true },
      include: {
        tours: {
          where: {
            tour: {
              isLive: true,
            },
          },
          include: {
            tour: {
              include: {
                stays: true,
                reviews: { include: { user: { select: { name: true } } } },
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!travelStyle) return null;

    let mappedTours: TourPackageDetail[] = travelStyle.tours.map((item) => {
      const tour = item.tour;
      return {
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        duration: tour.duration || "",
        daysCount: parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "0", 10),
        nightsCount: Math.max(0, parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "1", 10) - 1),
        category: tour.category || travelStyle.name,
        destinations: tour.destinations || [],
        routeDisplay: tour.destinations || [],
        price: tour.price || 0,
        originalPrice: tour.originalPrice || tour.price || 0,
        rating: tour.reviews?.length ? tour.reviews.reduce((acc, r) => acc + r.rating, 0) / tour.reviews.length : 0,
        reviewsCount: tour.reviews?.length || 0,
        overview: tour.overview || "",
        images: tour.images || [],
        whyThisRoute: [],
        itinerary: Array.isArray(tour.itinerary) ? (tour.itinerary as any[]) : [],
        inclusions: tour.inclusions || [],
        exclusions: tour.exclusions || [],
        highlights: tour.highlights || [],
        reviewsList: [],
        stays: (tour.stays || []).map((s) => ({
          id: s.id,
          destination: s.destination,
          nights: s.nights,
          stayType: s.stayType || undefined,
          displayOrder: s.displayOrder,
          propertyId: s.propertyId,
        })),
        transports: [],
        isLive: tour.isLive,
        maxPersons: tour.maxPersons || 2,
        badge: travelStyle.name,
      };
    });

    if (filters) {
      if (filters.duration) {
        const days = parseInt(filters.duration, 10);
        if (!isNaN(days)) {
          mappedTours = mappedTours.filter((t) => t.daysCount === days);
        }
      }
      if (filters.destination) {
        const destLower = filters.destination.toLowerCase();
        mappedTours = mappedTours.filter((t) =>
          t.destinations.some((d) => d.toLowerCase().includes(destLower))
        );
      }
      if (filters.maxPrice) {
        mappedTours = mappedTours.filter((t) => t.price <= filters.maxPrice!);
      }
      if (filters.sort) {
        if (filters.sort === "price-asc") mappedTours.sort((a, b) => a.price - b.price);
        else if (filters.sort === "price-desc") mappedTours.sort((a, b) => b.price - a.price);
        else if (filters.sort === "duration-asc") mappedTours.sort((a, b) => a.daysCount - b.daysCount);
        else if (filters.sort === "duration-desc") mappedTours.sort((a, b) => b.daysCount - a.daysCount);
        else if (filters.sort === "rating") mappedTours.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    }

    return {
      style: {
        id: travelStyle.id,
        name: travelStyle.name,
        slug: travelStyle.slug,
        description: travelStyle.description,
        imageUrl: travelStyle.imageUrl,
        imageAlt: travelStyle.imageAlt,
        isActive: travelStyle.isActive,
        displayOrder: travelStyle.displayOrder,
      },
      tours: mappedTours,
    };
  } catch (error) {
    console.warn("Failed to fetch tours by travel style:", error);
    return null;
  }
});

