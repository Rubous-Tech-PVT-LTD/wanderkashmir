import prisma from "@/lib/prisma";

export interface AdminTourListItem {
  id: string;
  slug: string;
  title: string;
  duration: string;
  price: number;
  originalPrice: number | null;
  category: string;
  categoryId: string | null;
  categoryName: string | null;
  isLive: boolean;
  destinations: string[];
  maxPersons: number;
  badge: string | null;
  images: string[];
  travelStyles: { id: string; name: string; slug: string }[];
  updatedAt: Date;
  createdAt: Date;
}

export interface GetAdminToursParams {
  search?: string;
  status?: "all" | "live" | "draft";
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface GetAdminToursResult {
  tours: AdminTourListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Server-side read-only listing with search, filtering, and pagination.
 * Directly queries the shared production database via Prisma.
 */
export async function getAdminToursList(params: GetAdminToursParams): Promise<GetAdminToursResult> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.status === "live") {
      where.isLive = true;
    } else if (params.status === "draft") {
      where.isLive = false;
    }

    if (params.categoryId && params.categoryId.trim() !== "") {
      where.categoryId = params.categoryId;
    }

    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { category: { contains: term, mode: "insensitive" } },
        { id: { contains: term, mode: "insensitive" } },
        { destinations: { has: term } },
      ];
    }

    const [toursRaw, totalCount] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          tourCategory: { select: { id: true, name: true } },
          travelStyles: {
            include: {
              travelStyle: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.tour.count({ where }),
    ]);

    const tours: AdminTourListItem[] = toursRaw.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      duration: t.duration,
      price: t.price,
      originalPrice: t.originalPrice,
      category: t.category,
      categoryId: t.categoryId,
      categoryName: t.tourCategory?.name || t.category,
      isLive: t.isLive,
      destinations: t.destinations,
      maxPersons: t.maxPersons,
      badge: t.badge,
      images: t.images,
      travelStyles: t.travelStyles.map((ts) => ({
        id: ts.travelStyle.id,
        name: ts.travelStyle.name,
        slug: ts.travelStyle.slug,
      })),
      updatedAt: t.updatedAt,
      createdAt: t.createdAt,
    }));

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return {
      tours,
      totalCount,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching admin tours list:", error);
    return {
      tours: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single Tour by ID with all relations for the admin edit form.
 */
export async function getAdminTourById(id: string) {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        tourCategory: true,
        travelStyles: {
          include: {
            travelStyle: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
        stays: {
          include: {
            property: { select: { id: true, name: true, location: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
        transports: {
          include: {
            vehicle: { select: { id: true, make: true, model: true } },
            driver: { select: { id: true, name: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
        experiences: {
          include: {
            experience: { select: { id: true, title: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
        travelGuides: {
          include: {
            guide: { select: { id: true, title: true, slug: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return tour;
  } catch (error) {
    console.error(`Error fetching admin tour by id (${id}):`, error);
    return null;
  }
}

/**
 * Fetch available categories, travel styles, properties, vehicles, drivers, experiences,
 * and travel guides for the tour editor form.
 */
export async function getAdminTourFormOptions() {
  try {
    const [categories, travelStyles, properties, vehicles, drivers, experiences, travelGuides] =
      await Promise.all([
        prisma.tourCategory.findMany({
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        }),
        prisma.travelStyle.findMany({
          where: { isActive: true },
          select: { id: true, name: true, slug: true, displayOrder: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.property.findMany({
          where: { isApproved: true, status: "APPROVED" },
          select: { id: true, name: true, location: true, propertyType: true },
          orderBy: { name: "asc" },
        }),
        prisma.vehicle.findMany({
          select: { id: true, make: true, model: true, type: true, registrationNum: true },
          orderBy: { model: "asc" },
        }),
        prisma.driver.findMany({
          where: { status: "ACTIVE" },
          select: { id: true, name: true, phone: true },
          orderBy: { name: "asc" },
        }),
        prisma.experience.findMany({
          select: { id: true, title: true, duration: true },
          orderBy: { title: "asc" },
        }),
        prisma.seoLandingPage.findMany({
          where: { type: "BLOG" },
          select: { id: true, title: true, slug: true },
          orderBy: { title: "asc" },
        }),
      ]);

    return {
      categories,
      travelStyles,
      properties,
      vehicles,
      drivers,
      experiences,
      travelGuides,
    };
  } catch (error) {
    console.error("Error fetching admin tour form options:", error);
    return {
      categories: [],
      travelStyles: [],
      properties: [],
      vehicles: [],
      drivers: [],
      experiences: [],
      travelGuides: [],
    };
  }
}
