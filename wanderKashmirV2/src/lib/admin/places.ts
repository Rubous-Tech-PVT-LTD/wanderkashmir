import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Accurately determines if a database error is specifically due to unmigrated / missing schema columns.
 * Recognizes:
 * - Prisma P2022: Column does not exist in the database
 * - Prisma P2021: Table does not exist in the database
 * - PostgreSQL error code 42703 (undefined_column) from database driver
 * - Specific message matching for missing columns while guarding against connection / network failures.
 *
 * Strictly rejects and does not match:
 * - P1000 (Authentication failure)
 * - P1001 (Can't reach database server)
 * - P1002 (Database timeout)
 * - PrismaClientInitializationError
 * - Network errors (ECONNREFUSED, ETIMEDOUT, ENOTFOUND)
 */
export function isSchemaMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const errObj = error as Record<string, unknown>;

  // 1. Definitively reject initialization / connection failures
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    errObj.code === "P1000" ||
    errObj.code === "P1001" ||
    errObj.code === "P1002" ||
    errObj.code === "P1003"
  ) {
    return false;
  }

  // 2. Evaluate Prisma Known Request Errors (by code or instanceof)
  if (errObj.code === "P2022" || errObj.code === "P2021") {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Any other known code (P2002, etc.) is NOT a schema column error
    return false;
  }

  // 3. Driver-level PostgreSQL error code check (42703 = undefined_column)
  if (errObj.code === "42703" || errObj.code === 42703) {
    return true;
  }

  // 4. Specific driver message check, rejecting network error patterns
  const message = typeof errObj.message === "string" ? errObj.message : "";
  if (
    message.includes("42703") ||
    message.includes("undefined_column") ||
    (/column\s+["']?[a-zA-Z0-9_]+["']?\s+does not exist/i.test(message) &&
      !message.includes("ECONNREFUSED") &&
      !message.includes("ETIMEDOUT") &&
      !message.includes("ENOTFOUND"))
  ) {
    return true;
  }

  return false;
}

export interface AdminPlaceItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  gallery?: unknown;
  destination: string | null;
  timings?: string | null;
  entryFee?: string | null;
  bestTimeToVisit?: string | null;
  thingsToDo?: unknown;
  visitorTips?: unknown;
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  isFeatured: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  destinationPlaces: {
    id: string;
    displayOrder: number;
    destination: {
      id: string;
      title: string;
      slug: string;
      h1Heading?: string;
    };
  }[];
}

export interface GetAdminPlacesParams {
  search?: string;
  destinationId?: string;
  status?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export interface GetAdminPlacesResult {
  places: AdminPlaceItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    total: number;
    active: number;
    inactive: number;
    featured: number;
  };
}

export interface AvailableDestinationOption {
  id: string;
  title: string;
  slug: string;
  h1Heading: string;
  workflowState: string;
}

/**
 * Fetch paginated places list for Admin Places CMS with search, destination filter, and status filter.
 */
export async function getAdminPlaces(params: GetAdminPlacesParams = {}): Promise<GetAdminPlacesResult> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // 1. Status Filter
    if (params.status && params.status !== "ALL") {
      where.status = params.status;
    }

    // 2. Featured Filter
    if (params.isFeatured !== undefined) {
      where.isFeatured = params.isFeatured;
    }

    // 3. Search Filter (Name, Slug, or Destination string)
    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { destination: { contains: term, mode: "insensitive" } },
      ];
    }

    // 4. Relational Destination Filter
    if (params.destinationId && params.destinationId !== "ALL") {
      where.destinationPlaces = {
        some: {
          destinationId: params.destinationId,
        },
      };
    }

    let placesRaw: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      gallery?: unknown;
      destination: string | null;
      timings?: string | null;
      entryFee?: string | null;
      bestTimeToVisit?: string | null;
      thingsToDo?: unknown;
      visitorTips?: unknown;
      seoTitle?: string | null;
      metaDescription?: string | null;
      canonicalUrl?: string | null;
      isFeatured?: boolean;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      destinationPlaces: Array<{
        id: string;
        displayOrder: number;
        destination: {
          id: string;
          title: string;
          slug: string;
          h1Heading?: string;
        };
      }>;
    }> = [];
    let totalCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;
    let featuredCount = 0;

    try {
      [placesRaw, totalCount, activeCount, inactiveCount] = await Promise.all([
        prisma.place.findMany({
          where,
          include: {
            destinationPlaces: {
              orderBy: { displayOrder: "asc" },
              include: {
                destination: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    h1Heading: true,
                  },
                },
              },
            },
          },
          orderBy: [{ updatedAt: "desc" }],
          skip,
          take: limit,
        }),
        prisma.place.count({ where }),
        prisma.place.count({ where: { status: "ACTIVE" } }),
        prisma.place.count({ where: { status: "INACTIVE" } }),
      ]);

      try {
        featuredCount = await prisma.place.count({ where: { isFeatured: true } });
      } catch (featuredError) {
        if (!isSchemaMissingColumnError(featuredError)) {
          throw featuredError;
        }
        featuredCount = 0;
      }
    } catch (primaryQueryError) {
      if (!isSchemaMissingColumnError(primaryQueryError)) {
        throw primaryQueryError;
      }
      console.warn("Notice: Post-migration Place query failed due to unmigrated columns; falling back to pre-migration baseline columns:", primaryQueryError);
      const fallbackWhere: Record<string, unknown> = {};
      if (params.status && params.status !== "ALL") {
        fallbackWhere.status = params.status;
      }
      if (params.search && params.search.trim() !== "") {
        const term = params.search.trim();
        fallbackWhere.OR = [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
          { destination: { contains: term, mode: "insensitive" } },
        ];
      }
      if (params.destinationId && params.destinationId !== "ALL") {
        fallbackWhere.destinationPlaces = {
          some: {
            destinationId: params.destinationId,
          },
        };
      }

      [placesRaw, totalCount, activeCount, inactiveCount] = await Promise.all([
        prisma.place.findMany({
          where: fallbackWhere,
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
                    title: true,
                    slug: true,
                    h1Heading: true,
                  },
                },
              },
            },
          },
          orderBy: [{ updatedAt: "desc" }],
          skip,
          take: limit,
        }),
        prisma.place.count({ where: fallbackWhere }),
        prisma.place.count({ where: { status: "ACTIVE" } }),
        prisma.place.count({ where: { status: "INACTIVE" } }),
      ]);
      featuredCount = 0;
    }

    const places: AdminPlaceItem[] = placesRaw.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      imageUrl: p.imageUrl,
      gallery: p.gallery,
      destination: p.destination,
      timings: p.timings,
      entryFee: p.entryFee,
      bestTimeToVisit: p.bestTimeToVisit,
      thingsToDo: p.thingsToDo,
      visitorTips: p.visitorTips,
      seoTitle: p.seoTitle,
      metaDescription: p.metaDescription,
      canonicalUrl: p.canonicalUrl,
      isFeatured: Boolean(p.isFeatured),
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      destinationPlaces: p.destinationPlaces.map((dp) => ({
        id: dp.id,
        displayOrder: dp.displayOrder,
        destination: dp.destination,
      })),
    }));

    return {
      places,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      stats: {
        total: activeCount + inactiveCount,
        active: activeCount,
        inactive: inactiveCount,
        featured: featuredCount,
      },
    };
  } catch (error) {
    console.error("Error in getAdminPlaces:", error);
    return {
      places: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
      stats: { total: 0, active: 0, inactive: 0, featured: 0 },
    };
  }
}

/**
 * Fetch a single Place by ID including linked destinations, gallery, and visitor metadata.
 */
export async function getAdminPlaceById(id: string): Promise<AdminPlaceItem | null> {
  try {
    if (!id || typeof id !== "string") return null;

    let place: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      gallery?: unknown;
      destination: string | null;
      timings?: string | null;
      entryFee?: string | null;
      bestTimeToVisit?: string | null;
      thingsToDo?: unknown;
      visitorTips?: unknown;
      seoTitle?: string | null;
      metaDescription?: string | null;
      canonicalUrl?: string | null;
      isFeatured?: boolean;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      destinationPlaces: Array<{
        id: string;
        displayOrder: number;
        destination: {
          id: string;
          title: string;
          slug: string;
          h1Heading?: string;
        };
      }>;
    } | null = null;

    try {
      place = await prisma.place.findUnique({
        where: { id },
        include: {
          destinationPlaces: {
            orderBy: { displayOrder: "asc" },
            include: {
              destination: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  h1Heading: true,
                },
              },
            },
          },
        },
      });
    } catch (primaryFetchError) {
      if (!isSchemaMissingColumnError(primaryFetchError)) {
        throw primaryFetchError;
      }
      console.warn("Notice: Fetching single place using pre-migration baseline columns fallback:", primaryFetchError);
      place = await prisma.place.findUnique({
        where: { id },
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
                  title: true,
                  slug: true,
                  h1Heading: true,
                },
              },
            },
          },
        },
      });
    }

    if (!place) return null;

    return {
      id: place.id,
      name: place.name,
      slug: place.slug,
      description: place.description,
      imageUrl: place.imageUrl,
      gallery: place.gallery,
      destination: place.destination,
      timings: place.timings,
      entryFee: place.entryFee,
      bestTimeToVisit: place.bestTimeToVisit,
      thingsToDo: place.thingsToDo,
      visitorTips: place.visitorTips,
      seoTitle: place.seoTitle,
      metaDescription: place.metaDescription,
      canonicalUrl: place.canonicalUrl,
      isFeatured: Boolean(place.isFeatured),
      status: place.status,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
      destinationPlaces: place.destinationPlaces.map((dp) => ({
        id: dp.id,
        displayOrder: dp.displayOrder,
        destination: dp.destination,
      })),
    };
  } catch (error) {
    console.error("Error in getAdminPlaceById:", error);
    return null;
  }
}

/**
 * Fetch published destinations for linking inside Place CMS selectors.
 */
export async function getAvailableDestinations(): Promise<AvailableDestinationOption[]> {
  try {
    const destinations = await prisma.seoLandingPage.findMany({
      where: {
        type: "DESTINATION",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        h1Heading: true,
        workflowState: true,
      },
      orderBy: { title: "asc" },
    });

    return destinations.map((d) => ({
      id: d.id,
      title: d.title,
      slug: d.slug,
      h1Heading: d.h1Heading,
      workflowState: d.workflowState,
    }));
  } catch (error) {
    console.error("Error in getAvailableDestinations:", error);
    return [];
  }
}

