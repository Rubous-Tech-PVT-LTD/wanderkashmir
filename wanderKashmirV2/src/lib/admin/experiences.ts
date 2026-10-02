import prisma from "@/lib/prisma";

export interface AdminExperienceListItem {
  id: string;
  slug: string;
  title: string;
  destination: string;
  duration: string | null;
  basePrice: number | null;
  status: string;
  images: string[];
  toursCount: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface GetAdminExperiencesParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
}

export interface GetAdminExperiencesResult {
  experiences: AdminExperienceListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminExperiencesStats {
  total: number;
  active: number;
  inactive: number;
  totalTourLinks: number;
}

/**
 * Server-side experiences listing with search, filtering, and pagination.
 */
export async function getAdminExperiencesList(
  params: GetAdminExperiencesParams
): Promise<GetAdminExperiencesResult> {
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
        { title: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { destination: { contains: term, mode: "insensitive" } },
      ];
    }

    const [experiencesRaw, totalCount] = await Promise.all([
      prisma.experience.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          destination: true,
          duration: true,
          basePrice: true,
          status: true,
          images: true,
          updatedAt: true,
          createdAt: true,
          _count: {
            select: { tourExperiences: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.experience.count({ where }),
    ]);

    const experiences: AdminExperienceListItem[] = experiencesRaw.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      destination: e.destination,
      duration: e.duration,
      basePrice: e.basePrice,
      status: e.status,
      images: Array.isArray(e.images) ? e.images : [],
      toursCount: e._count.tourExperiences,
      updatedAt: e.updatedAt,
      createdAt: e.createdAt,
    }));

    return {
      experiences,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error in getAdminExperiencesList:", error);
    return {
      experiences: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single experience by ID with connected tour packages.
 */
export async function getAdminExperienceById(id: string) {
  try {
    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        tourExperiences: {
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                slug: true,
                duration: true,
                price: true,
                isLive: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return experience;
  } catch (error) {
    console.error(`Error in getAdminExperienceById for ${id}:`, error);
    return null;
  }
}

/**
 * Fetch all available tours for linking to an experience.
 */
export async function getAvailableToursForExperience() {
  try {
    const tours = await prisma.tour.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        isLive: true,
      },
      orderBy: { title: "asc" },
    });
    return tours;
  } catch (error) {
    console.error("Error fetching available tours for experience:", error);
    return [];
  }
}

/**
 * Aggregate statistics for Experiences.
 */
export async function getAdminExperiencesStats(): Promise<AdminExperiencesStats> {
  try {
    const [total, active, inactive, totalTourLinks] = await Promise.all([
      prisma.experience.count(),
      prisma.experience.count({ where: { status: "ACTIVE" } }),
      prisma.experience.count({ where: { status: { not: "ACTIVE" } } }),
      prisma.tourExperience.count(),
    ]);

    return {
      total,
      active,
      inactive,
      totalTourLinks,
    };
  } catch (error) {
    console.error("Error in getAdminExperiencesStats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      totalTourLinks: 0,
    };
  }
}
