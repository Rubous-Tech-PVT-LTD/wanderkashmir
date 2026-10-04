import prisma from "@/lib/prisma";

export interface AdminTravelStyleItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  isActive: boolean;
  displayOrder: number;
  toursCount: number;
  liveToursCount: number;
  draftToursCount: number;
  tours: {
    id: string;
    title: string;
    slug: string;
    isLive: boolean;
    duration: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAdminTravelStylesParams {
  search?: string;
}

/**
 * Server-side read-only listing with search and connected tour counts.
 * Directly queries the shared production database via Prisma.
 */
export async function getAdminTravelStylesList(params?: GetAdminTravelStylesParams): Promise<AdminTravelStyleItem[]> {
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

    const stylesRaw = await prisma.travelStyle.findMany({
      where,
      orderBy: { displayOrder: "asc" },
      include: {
        tours: {
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                slug: true,
                isLive: true,
                duration: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
        _count: {
          select: {
            tours: true,
          },
        },
      },
    });

    return stylesRaw.map((s) => {
      let liveToursCount = 0;
      let draftToursCount = 0;
      const tours = s.tours.map((t) => {
        if (t.tour.isLive) {
          liveToursCount++;
        } else {
          draftToursCount++;
        }
        return {
          id: t.tour.id,
          title: t.tour.title,
          slug: t.tour.slug,
          isLive: t.tour.isLive,
          duration: t.tour.duration,
        };
      });

      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        imageUrl: s.imageUrl,
        imageAlt: s.imageAlt,
        isActive: s.isActive,
        displayOrder: s.displayOrder,
        toursCount: s._count.tours,
        liveToursCount,
        draftToursCount,
        tours,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error fetching admin travel styles list:", error);
    return [];
  }
}

/**
 * Fetch a single Travel Style by ID with connected tours for editing.
 */
export async function getAdminTravelStyleById(id: string) {
  try {
    const style = await prisma.travelStyle.findUnique({
      where: { id },
      include: {
        tours: {
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                slug: true,
                isLive: true,
                price: true,
                duration: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
        _count: {
          select: { tours: true },
        },
      },
    });

    return style;
  } catch (error) {
    console.error(`Error fetching travel style by id (${id}):`, error);
    return null;
  }
}

/**
 * Fetch all available production Tours for selection in TravelStyle relation manager.
 */
export async function getAllToursForStyleSelect() {
  try {
    return await prisma.tour.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isLive: true,
        duration: true,
        price: true,
      },
      orderBy: { title: "asc" },
    });
  } catch (error) {
    console.error("Error fetching tours for travel style selection:", error);
    return [];
  }
}
