import prisma from "@/lib/prisma";

export interface AdminTourCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalToursCount: number;
  liveToursCount: number;
  draftToursCount: number;
  tours: {
    id: string;
    title: string;
    slug: string;
    duration: string;
    price: number;
    isLive: boolean;
  }[];
}

export interface GetAdminTourCategoriesParams {
  search?: string;
}

/**
 * Server-side read-only listing with search and connected tour counts.
 * Directly queries the shared production database via Prisma.
 */
export async function getAdminTourCategoriesList(
  params?: GetAdminTourCategoriesParams
): Promise<AdminTourCategoryItem[]> {
  try {
    const where: Record<string, unknown> = {};

    if (params?.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { slug: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { id: { contains: term, mode: "insensitive" } },
      ];
    }

    const categoriesRaw = await prisma.tourCategory.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        tours: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            price: true,
            isLive: true,
          },
          orderBy: { title: "asc" },
        },
        _count: {
          select: {
            tours: true,
          },
        },
      },
    });

    return categoriesRaw.map((cat) => {
      const totalToursCount = cat._count.tours;
      let liveToursCount = 0;
      let draftToursCount = 0;

      cat.tours.forEach((t) => {
        if (t.isLive) {
          liveToursCount++;
        } else {
          draftToursCount++;
        }
      });

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        totalToursCount,
        liveToursCount,
        draftToursCount,
        tours: cat.tours,
      };
    });
  } catch (error) {
    console.error("Error fetching admin tour categories list:", error);
    return [];
  }
}

/**
 * Fetch a single TourCategory by ID with full connected tours.
 */
export async function getAdminTourCategoryById(id: string): Promise<AdminTourCategoryItem | null> {
  try {
    const cat = await prisma.tourCategory.findUnique({
      where: { id },
      include: {
        tours: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            price: true,
            isLive: true,
          },
          orderBy: { title: "asc" },
        },
        _count: {
          select: {
            tours: true,
          },
        },
      },
    });

    if (!cat) return null;

    let liveToursCount = 0;
    let draftToursCount = 0;

    cat.tours.forEach((t) => {
      if (t.isLive) {
        liveToursCount++;
      } else {
        draftToursCount++;
      }
    });

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      totalToursCount: cat._count.tours,
      liveToursCount,
      draftToursCount,
      tours: cat.tours,
    };
  } catch (error) {
    console.error(`Error fetching tour category by ID (${id}):`, error);
    return null;
  }
}

/**
 * Fetch all available categories except one (for reassigning tours before deletion).
 */
export async function getAlternativeCategories(excludeId: string) {
  try {
    return await prisma.tourCategory.findMany({
      where: {
        id: { not: excludeId },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching alternative categories:", error);
    return [];
  }
}
