import prisma from "@/lib/prisma";
import { SeoWorkflowState } from "@prisma/client";

export interface AdminDestinationListItem {
  id: string;
  slug: string;
  title: string;
  h1Heading: string;
  description: string | null;
  imageUrl: string | null;
  workflowState: SeoWorkflowState;
  placesCount: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface AdminPlaceListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  destination: string | null;
  status: string;
  linkedDestinationsCount: number;
  linkedDestinations: { id: string; slug: string; title: string }[];
  updatedAt: Date;
  createdAt: Date;
}

export interface GetAdminDestinationsParams {
  search?: string;
  status?: "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED";
  page?: number;
  limit?: number;
}

export interface GetAdminDestinationsResult {
  destinations: AdminDestinationListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAdminPlacesParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
}

export interface GetAdminPlacesResult {
  places: AdminPlaceListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminDestinationsStats {
  totalDestinations: number;
  publishedDestinations: number;
  draftDestinations: number;
  totalPlaces: number;
  activePlaces: number;
  inactivePlaces: number;
  totalLinkedPlaces: number;
}

/**
 * Server-side destinations list with search, filtering, and pagination.
 * Directly queries SeoLandingPage records where type = "DESTINATION".
 */
export async function getAdminDestinationsList(
  params: GetAdminDestinationsParams
): Promise<GetAdminDestinationsResult> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      type: "DESTINATION",
    };

    if (params.status && params.status !== "ALL") {
      where.workflowState = params.status as SeoWorkflowState;
    }

    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { h1Heading: { contains: term, mode: "insensitive" } },
      ];
    }

    const [destsRaw, totalCount] = await Promise.all([
      prisma.seoLandingPage.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          h1Heading: true,
          description: true,
          imageUrl: true,
          workflowState: true,
          updatedAt: true,
          createdAt: true,
          _count: {
            select: { places: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.seoLandingPage.count({ where }),
    ]);

    const destinations: AdminDestinationListItem[] = destsRaw.map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      h1Heading: d.h1Heading,
      description: d.description,
      imageUrl: d.imageUrl,
      workflowState: d.workflowState,
      placesCount: d._count.places,
      updatedAt: d.updatedAt,
      createdAt: d.createdAt,
    }));

    return {
      destinations,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error in getAdminDestinationsList:", error);
    return {
      destinations: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Server-side places list with search, filtering, and pagination.
 */
export async function getAdminPlacesList(
  params: GetAdminPlacesParams
): Promise<GetAdminPlacesResult> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.status && params.status !== "ALL") {
      where.status = params.status;
    }

    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { destination: { contains: term, mode: "insensitive" } },
      ];
    }

    const [placesRaw, totalCount] = await Promise.all([
      prisma.place.findMany({
        where,
        include: {
          destinationPlaces: {
            include: {
              destination: {
                select: { id: true, slug: true, title: true },
              },
            },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.place.count({ where }),
    ]);

    const places: AdminPlaceListItem[] = placesRaw.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      imageUrl: p.imageUrl,
      destination: p.destination,
      status: p.status,
      linkedDestinationsCount: p.destinationPlaces.length,
      linkedDestinations: p.destinationPlaces.map((dp) => dp.destination),
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    }));

    return {
      places,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error in getAdminPlacesList:", error);
    return {
      places: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single destination by ID with linked places and structured CMS sections.
 */
export async function getAdminDestinationById(id: string) {
  try {
    const destination = await prisma.seoLandingPage.findUnique({
      where: { id },
      include: {
        places: {
          orderBy: { displayOrder: "asc" },
          include: {
            place: true,
          },
        },
      },
    });

    if (!destination || destination.type !== "DESTINATION") {
      return null;
    }

    return destination;
  } catch (error) {
    console.error(`Error in getAdminDestinationById for ${id}:`, error);
    return null;
  }
}

/**
 * Fetch a single place by ID with its linked destinations.
 */
export async function getAdminPlaceById(id: string) {
  try {
    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        destinationPlaces: {
          include: {
            destination: {
              select: { id: true, slug: true, title: true, workflowState: true },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return place;
  } catch (error) {
    console.error(`Error in getAdminPlaceById for ${id}:`, error);
    return null;
  }
}

/**
 * Fetch all available places for linking to a destination.
 */
export async function getAllAvailablePlaces() {
  try {
    const places = await prisma.place.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        destination: true,
        imageUrl: true,
      },
      orderBy: { name: "asc" },
    });
    return places;
  } catch (error) {
    console.error("Error fetching all available places:", error);
    return [];
  }
}

/**
 * Get aggregate statistics across destinations and places.
 */
export async function getAdminDestinationsStats(): Promise<AdminDestinationsStats> {
  try {
    const [
      totalDestinations,
      publishedDestinations,
      draftDestinations,
      totalPlaces,
      activePlaces,
      inactivePlaces,
      totalLinkedPlaces,
    ] = await Promise.all([
      prisma.seoLandingPage.count({ where: { type: "DESTINATION" } }),
      prisma.seoLandingPage.count({
        where: { type: "DESTINATION", workflowState: "PUBLISHED" },
      }),
      prisma.seoLandingPage.count({
        where: { type: "DESTINATION", workflowState: { not: "PUBLISHED" } },
      }),
      prisma.place.count(),
      prisma.place.count({ where: { status: "ACTIVE" } }),
      prisma.place.count({ where: { status: { not: "ACTIVE" } } }),
      prisma.destinationPlace.count(),
    ]);

    return {
      totalDestinations,
      publishedDestinations,
      draftDestinations,
      totalPlaces,
      activePlaces,
      inactivePlaces,
      totalLinkedPlaces,
    };
  } catch (error) {
    console.error("Error in getAdminDestinationsStats:", error);
    return {
      totalDestinations: 0,
      publishedDestinations: 0,
      draftDestinations: 0,
      totalPlaces: 0,
      activePlaces: 0,
      inactivePlaces: 0,
      totalLinkedPlaces: 0,
    };
  }
}
