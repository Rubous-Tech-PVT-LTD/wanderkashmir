import prisma from "../lib/prisma";
import { TourPackageDetail } from "./liveToursData";
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
        tourCategory: true,
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
          const matched = destPages.find((p: { slug: string; title: string; h1Heading: string | null }) => {
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
      .filter((tg: { guide?: { type: string; workflowState: string; title: string; slug: string; imageUrl?: string | null; description?: string | null } | null }) => Boolean(tg.guide && tg.guide.type === "BLOG" && tg.guide.workflowState === "PUBLISHED"))
      .map((tg: { id: string; guideId: string; displayOrder: number; guide: { title: string; slug: string; imageUrl?: string | null; description?: string | null } }) => ({
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
      category: tour.tourCategory?.name || tour.category || "general",
      categoryId: tour.categoryId || null,
      tourCategory: tour.tourCategory
        ? {
            id: tour.tourCategory.id,
            name: tour.tourCategory.name,
            slug: tour.tourCategory.slug,
          }
        : null,
      destinations: tour.destinations || [],
      routeDisplay: tour.destinations || [],
      resolvedDestinations,
      price: tour.price || 0,
      originalPrice: tour.originalPrice || tour.price || 0,
      rating: tour.reviews?.length ? tour.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / tour.reviews.length : 0,
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
      reviewsList: tour.reviews?.map((r: { user?: { name: string | null } | null; createdAt: Date; rating: number; comment?: string | null }) => ({
        name: r.user?.name || "Traveler",
        avatar: "",
        location: "", // The user instructed to hide the fallback reviewer location if unavailable
        date: r.createdAt.toISOString(),
        rating: r.rating,
        text: r.comment || "",
      })) || [],
      stays: tour.stays?.map((s: { id: string; destination: string; nights: number; stayType?: string | null; displayOrder: number; propertyId?: string | null }) => ({
        id: s.id,
        destination: s.destination,
        nights: s.nights,
        stayType: s.stayType || undefined,
        displayOrder: s.displayOrder,
        propertyId: s.propertyId,
      })) || [],
      transports: tour.transports?.map((t: { id: string; origin: string; destination: string; purpose?: string | null; displayOrder: number; vehicleId?: string | null; driverId?: string | null }) => ({
        id: t.id,
        origin: t.origin,
        destination: t.destination,
        purpose: t.purpose,
        displayOrder: t.displayOrder,
        vehicleId: t.vehicleId,
        driverId: t.driverId,
      })) || [],
      experiences: tour.experiences?.map((te: NonNullable<typeof tour.experiences>[number]) => ({
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
      include: { tourCategory: true },
      take: 4,
    });

    return tours.map((tour: (typeof tours)[number]) => ({
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      duration: tour.duration || "",
      daysCount: parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "0", 10),
      nightsCount: Math.max(0, parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "1", 10) - 1),
      category: tour.tourCategory?.name || tour.category || "general",
      categoryId: tour.categoryId || null,
      tourCategory: tour.tourCategory
        ? {
            id: tour.tourCategory.id,
            name: tour.tourCategory.name,
            slug: tour.tourCategory.slug,
          }
        : null,
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

    let mappedTours: TourPackageDetail[] = travelStyle.tours.map((item: (typeof travelStyle.tours)[number]) => {
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
        rating: tour.reviews?.length ? tour.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / tour.reviews.length : 0,
        reviewsCount: tour.reviews?.length || 0,
        overview: tour.overview || "",
        images: tour.images || [],
        whyThisRoute: [],
        itinerary: Array.isArray(tour.itinerary) ? (tour.itinerary as any[]) : [],
        inclusions: tour.inclusions || [],
        exclusions: tour.exclusions || [],
        highlights: tour.highlights || [],
        reviewsList: [],
        stays: (tour.stays || []).map((s: { id: string; destination: string; nights: number; stayType?: string | null; displayOrder: number; propertyId?: string | null }) => ({
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

export interface TourCategoryListingData {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    showInFilter: boolean;
    displayOrder: number;
  };
  tours: TourPackageDetail[];
}

export const getToursByCategory = cache(async function(
  categorySlug: string,
  filters?: {
    duration?: string;
    destination?: string;
    maxPrice?: number;
    sort?: string;
  }
): Promise<TourCategoryListingData | null> {
  try {
    const category = await prisma.tourCategory.findFirst({
      where: { slug: categorySlug, showInFilter: true },
      include: {
        tours: {
          where: {
            isLive: true,
          },
          include: {
            stays: true,
            reviews: { include: { user: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!category) return null;

    let mappedTours: TourPackageDetail[] = category.tours.map((tour: (typeof category.tours)[number]) => ({
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      duration: tour.duration || "",
      daysCount: parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "0", 10),
      nightsCount: Math.max(0, parseInt((tour.duration || "0").match(/(\d+)/)?.[0] || "1", 10) - 1),
      category: tour.category || category.name,
      destinations: tour.destinations || [],
      routeDisplay: tour.destinations || [],
      price: tour.price || 0,
      originalPrice: tour.originalPrice || tour.price || 0,
      rating: tour.reviews?.length
        ? tour.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / tour.reviews.length
        : 0,
      reviewsCount: tour.reviews?.length || 0,
      overview: tour.overview || "",
      images: tour.images || [],
      whyThisRoute: [],
      itinerary: Array.isArray(tour.itinerary) ? (tour.itinerary as any[]) : [],
      inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [],
      highlights: tour.highlights || [],
      reviewsList: [],
      stays: (tour.stays || []).map((s: { id: string; destination: string; nights: number; stayType?: string | null; displayOrder: number; propertyId?: string | null }) => ({
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
      badge: category.name,
    }));

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
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        showInFilter: category.showInFilter,
        displayOrder: category.displayOrder,
      },
      tours: mappedTours,
    };
  } catch (error) {
    console.warn("Failed to fetch tours by category:", error);
    return null;
  }
});

