import prisma from "@/lib/prisma";
import { PropertyType } from "@prisma/client";

export interface AdminPropertyListItem {
  id: string;
  name: string;
  location: string;
  description: string | null;
  pricePerNight: number;
  propertyType: PropertyType;
  status: string;
  isApproved: boolean;
  rejectionReason: string | null;
  images: string[];
  amenities: string[];
  bedrooms: number;
  beds: number;
  guests: number;
  totalRooms: number;
  availableRooms: number;
  breakfastIncluded: boolean;
  dinnerIncluded: boolean;
  vendorProfile: {
    id: string;
    businessName: string;
    type: string;
    user?: {
      name: string | null;
      email: string | null;
    } | null;
  } | null;
  roomTypesCount: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAdminPropertiesParams {
  search?: string;
  propertyType?: "ALL" | "HOTEL" | "RESORT" | "HOMESTAY" | "HOUSEBOAT";
  status?: "ALL" | "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED";
  page?: number;
  limit?: number;
}

export interface GetAdminPropertiesResult {
  properties: AdminPropertyListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminPropertiesStats {
  total: number;
  approved: number;
  pending: number;
  suspended: number;
  rejected: number;
  byType: {
    hotel: number;
    resort: number;
    homestay: number;
    houseboat: number;
  };
}

/**
 * Server-side properties listing with search, filtering, and pagination.
 * Directly queries the shared production database via Prisma.
 */
export async function getAdminPropertiesList(
  params: GetAdminPropertiesParams
): Promise<GetAdminPropertiesResult> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Filter by Property.propertyType (NOT VendorProfile.type)
    if (params.propertyType && params.propertyType !== "ALL") {
      where.propertyType = params.propertyType as PropertyType;
    }

    // Filter by approval/status
    if (params.status && params.status !== "ALL") {
      if (params.status === "APPROVED") {
        where.isApproved = true;
        where.status = "APPROVED";
      } else if (params.status === "PENDING") {
        where.isApproved = false;
        where.status = { notIn: ["REJECTED", "SUSPENDED"] };
      } else if (params.status === "SUSPENDED") {
        where.status = "SUSPENDED";
      } else if (params.status === "REJECTED") {
        where.status = "REJECTED";
      }
    }

    // Search query
    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { vendorProfile: { businessName: { contains: term, mode: "insensitive" } } },
      ];
    }

    const [propsRaw, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          vendorProfile: {
            select: {
              id: true,
              businessName: true,
              type: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              roomTypes: true,
              reviews: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    const properties: AdminPropertyListItem[] = propsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      description: p.description,
      pricePerNight: p.pricePerNight,
      propertyType: p.propertyType,
      status: p.status,
      isApproved: p.isApproved,
      rejectionReason: p.rejectionReason,
      images: Array.isArray(p.images) ? p.images : [],
      amenities: Array.isArray(p.amenities) ? p.amenities : [],
      bedrooms: p.bedrooms,
      beds: p.beds,
      guests: p.guests,
      totalRooms: p.totalRooms,
      availableRooms: p.availableRooms,
      breakfastIncluded: p.breakfastIncluded,
      dinnerIncluded: p.dinnerIncluded,
      vendorProfile: p.vendorProfile,
      roomTypesCount: p._count.roomTypes,
      reviewsCount: p._count.reviews,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return {
      properties,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error in getAdminPropertiesList:", error);
    return {
      properties: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single property with all CMS details, rooms, and reviews for editing.
 */
export async function getAdminPropertyById(id: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            type: true,
            email: true,
            phone: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        roomTypes: {
          orderBy: { basePrice: "asc" },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    return property;
  } catch (error) {
    console.error(`Error in getAdminPropertyById for ${id}:`, error);
    return null;
  }
}

/**
 * Get aggregate statistics across all properties in the production database.
 */
export async function getAdminPropertiesStats(): Promise<AdminPropertiesStats> {
  try {
    const [
      total,
      approved,
      pending,
      suspended,
      rejected,
      hotel,
      resort,
      homestay,
      houseboat,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { isApproved: true, status: "APPROVED" } }),
      prisma.property.count({ where: { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } } }),
      prisma.property.count({ where: { status: "SUSPENDED" } }),
      prisma.property.count({ where: { status: "REJECTED" } }),
      prisma.property.count({ where: { propertyType: "HOTEL" } }),
      prisma.property.count({ where: { propertyType: "RESORT" } }),
      prisma.property.count({ where: { propertyType: "HOMESTAY" } }),
      prisma.property.count({ where: { propertyType: "HOUSEBOAT" } }),
    ]);

    return {
      total,
      approved,
      pending,
      suspended,
      rejected,
      byType: {
        hotel,
        resort,
        homestay,
        houseboat,
      },
    };
  } catch (error) {
    console.error("Error in getAdminPropertiesStats:", error);
    return {
      total: 0,
      approved: 0,
      pending: 0,
      suspended: 0,
      rejected: 0,
      byType: {
        hotel: 0,
        resort: 0,
        homestay: 0,
        houseboat: 0,
      },
    };
  }
}

/**
 * Fetch available vendor profiles for property assignment.
 */
export async function getVendorsForSelection() {
  try {
    const vendors = await prisma.vendorProfile.findMany({
      select: {
        id: true,
        businessName: true,
        type: true,
      },
      orderBy: { businessName: "asc" },
    });
    return vendors;
  } catch (error) {
    console.error("Error fetching vendors for selection:", error);
    return [];
  }
}
