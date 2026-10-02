import prisma from "@/lib/prisma";

export interface AdminReviewListItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  entityType: "PROPERTY" | "TOUR" | "VEHICLE" | "GUIDE" | "GENERAL";
  entityName: string;
  entityLink?: string;
  property?: {
    id: string;
    name: string;
    location: string;
  } | null;
  tour?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface GetAdminReviewsParams {
  search?: string;
  entityType?: "ALL" | "PROPERTY" | "TOUR" | "OTHER";
  rating?: number;
  page?: number;
  limit?: number;
}

export interface GetAdminReviewsResult {
  reviews: AdminReviewListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminReviewsStats {
  total: number;
  averageRating: number;
  propertyReviewsCount: number;
  tourReviewsCount: number;
  fiveStarCount: number;
}

/**
 * Server-side review listing with search, filtering, and pagination.
 * Directly queries the production Prisma Review model.
 */
export async function getAdminReviewsList(
  params: GetAdminReviewsParams
): Promise<GetAdminReviewsResult> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Entity type filter
    if (params.entityType === "PROPERTY") {
      where.propertyId = { not: null };
    } else if (params.entityType === "TOUR") {
      where.tourId = { not: null };
    } else if (params.entityType === "OTHER") {
      where.AND = [
        { propertyId: null },
        { tourId: null },
      ];
    }

    // Rating filter (1-5)
    if (params.rating && params.rating >= 1 && params.rating <= 5) {
      where.rating = params.rating;
    }

    // Server-side search across comment, user name/email, property name, tour title
    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { comment: { contains: term, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
            ],
          },
        },
        {
          property: {
            name: { contains: term, mode: "insensitive" },
          },
        },
        {
          tour: {
            title: { contains: term, mode: "insensitive" },
          },
        },
      ];
    }

    const [reviewsRaw, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          tour: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
            },
          },
          guideProfile: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    const reviews: AdminReviewListItem[] = reviewsRaw.map((r) => {
      let entityType: AdminReviewListItem["entityType"] = "GENERAL";
      let entityName = "General / Direct";
      let entityLink: string | undefined = undefined;

      if (r.property) {
        entityType = "PROPERTY";
        entityName = r.property.name;
        entityLink = `/stays/${r.property.id}`;
      } else if (r.tour) {
        entityType = "TOUR";
        entityName = r.tour.title;
        entityLink = `/tours/${r.tour.slug}`;
      } else if (r.vehicle) {
        entityType = "VEHICLE";
        entityName = `${r.vehicle.make} ${r.vehicle.model}`.trim() || "Vehicle";
      } else if (r.guideProfile) {
        entityType = "GUIDE";
        entityName = "Guide Profile";
      }

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: r.user,
        entityType,
        entityName,
        entityLink,
        property: r.property,
        tour: r.tour,
      };
    });

    return {
      reviews,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error in getAdminReviewsList:", error);
    return {
      reviews: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single review by ID with complete relations for admin inspection.
 */
export async function getAdminReviewById(id: string) {
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            location: true,
            propertyType: true,
            status: true,
            isApproved: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            isLive: true,
          },
        },
        booking: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    return review;
  } catch (error) {
    console.error(`Error in getAdminReviewById for ${id}:`, error);
    return null;
  }
}

/**
 * Aggregate statistics for production Reviews.
 * Real metrics calculated from DB; zero fabricated statistics.
 */
export async function getAdminReviewsStats(): Promise<AdminReviewsStats> {
  try {
    const [total, aggregateRating, propertyReviewsCount, tourReviewsCount, fiveStarCount] =
      await Promise.all([
        prisma.review.count(),
        prisma.review.aggregate({
          _avg: { rating: true },
        }),
        prisma.review.count({ where: { propertyId: { not: null } } }),
        prisma.review.count({ where: { tourId: { not: null } } }),
        prisma.review.count({ where: { rating: 5 } }),
      ]);

    const avg = aggregateRating._avg.rating;
    const averageRating = avg ? Math.round(avg * 10) / 10 : 0;

    return {
      total,
      averageRating,
      propertyReviewsCount,
      tourReviewsCount,
      fiveStarCount,
    };
  } catch (error) {
    console.error("Error in getAdminReviewsStats:", error);
    return {
      total: 0,
      averageRating: 0,
      propertyReviewsCount: 0,
      tourReviewsCount: 0,
      fiveStarCount: 0,
    };
  }
}
