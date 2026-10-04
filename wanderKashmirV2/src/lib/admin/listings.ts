import prisma from "@/lib/prisma";
import { PropertyType } from "@prisma/client";

export interface AdminListingItem {
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
  bedDetails: string | null;
  googlePlaceId: string | null;
  faqs: Array<{ question: string; answer: string }> | null;
  vendorProfile: {
    id: string;
    businessName: string;
    type: string;
    vendorId: string | null;
    email: string | null;
    phone: string | null;
    user?: {
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  } | null;
  roomTypesCount: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAdminListingsParams {
  search?: string;
  propertyType?: "ALL" | "HOTEL" | "RESORT" | "HOMESTAY" | "HOUSEBOAT";
  status?: "ALL" | "PENDING" | "APPROVED" | "LIVE" | "SUSPENDED" | "REJECTED";
  vendorProfileId?: string;
  page?: number;
  limit?: number;
}

export interface GetAdminListingsResult {
  listings: AdminListingItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminListingsStats {
  total: number;
  pendingApprovals: number;
  liveListings: number;
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
 * Parses raw JSON FAQs into a typed array safely.
 */
function parseFaqs(faqsRaw: unknown): Array<{ question: string; answer: string }> | null {
  if (!faqsRaw) return null;
  if (Array.isArray(faqsRaw)) {
    return faqsRaw
      .filter((item) => item && typeof item === "object" && "question" in item && "answer" in item)
      .map((item) => ({
        question: String(item.question || ""),
        answer: String(item.answer || ""),
      }));
  }
  return null;
}

/**
 * Server-side paginated queries for Admin Listing Approvals and Live Listings.
 */
export async function getAdminListingsList(
  params: GetAdminListingsParams
): Promise<GetAdminListingsResult> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // 1. Property Type filter
    if (params.propertyType && params.propertyType !== "ALL") {
      const pType = params.propertyType.toUpperCase();
      if (["HOTEL", "RESORT", "HOMESTAY", "HOUSEBOAT"].includes(pType)) {
        where.propertyType = pType as PropertyType;
      }
    }

    // 2. Status / Approval filter
    if (params.status && params.status !== "ALL") {
      const s = params.status.toUpperCase();
      if (s === "PENDING") {
        where.OR = [
          { status: "PENDING" },
          { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
        ];
      } else if (s === "APPROVED" || s === "LIVE") {
        where.isApproved = true;
        where.status = { notIn: ["SUSPENDED", "REJECTED"] };
      } else if (s === "SUSPENDED") {
        where.status = "SUSPENDED";
      } else if (s === "REJECTED") {
        where.status = "REJECTED";
      }
    }

    // 3. Vendor filter
    if (params.vendorProfileId && params.vendorProfileId.trim() !== "") {
      where.vendorProfileId = params.vendorProfileId.trim();
    }

    // 4. Search query
    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      const searchConditions = [
        { name: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { vendorProfile: { businessName: { contains: term, mode: "insensitive" } } },
        { vendorProfile: { vendorId: { contains: term, mode: "insensitive" } } },
        { vendorProfile: { user: { name: { contains: term, mode: "insensitive" } } } },
        { vendorProfile: { user: { email: { contains: term, mode: "insensitive" } } } },
      ];

      if (where.OR && Array.isArray(where.OR)) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [rows, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          vendorProfile: {
            select: {
              id: true,
              businessName: true,
              type: true,
              vendorId: true,
              email: true,
              phone: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
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

    const listings: AdminListingItem[] = rows.map((p) => ({
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
      bedDetails: p.bedDetails,
      googlePlaceId: p.googlePlaceId,
      faqs: parseFaqs(p.faqs),
      vendorProfile: p.vendorProfile,
      roomTypesCount: p._count.roomTypes,
      reviewsCount: p._count.reviews,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return {
      listings,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error in getAdminListingsList:", error);
    return {
      listings: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single listing by ID with full relations for inspection.
 */
export async function getAdminListingById(id: string): Promise<AdminListingItem | null> {
  try {
    const p = await prisma.property.findUnique({
      where: { id },
      include: {
        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            type: true,
            vendorId: true,
            email: true,
            phone: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
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
    });

    if (!p) return null;

    return {
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
      bedDetails: p.bedDetails,
      googlePlaceId: p.googlePlaceId,
      faqs: parseFaqs(p.faqs),
      vendorProfile: p.vendorProfile,
      roomTypesCount: p._count.roomTypes,
      reviewsCount: p._count.reviews,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  } catch (error) {
    console.error(`Error in getAdminListingById for ${id}:`, error);
    return null;
  }
}

/**
 * Aggregate metrics for Listing Approvals (Module 08) & Live Listings (Module 09).
 */
export async function getAdminListingsStats(): Promise<AdminListingsStats> {
  try {
    const [
      total,
      pendingApprovals,
      liveListings,
      suspended,
      rejected,
      hotel,
      resort,
      homestay,
      houseboat,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({
        where: {
          OR: [
            { status: "PENDING" },
            { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
          ],
        },
      }),
      prisma.property.count({
        where: {
          isApproved: true,
          status: { notIn: ["SUSPENDED", "REJECTED"] },
        },
      }),
      prisma.property.count({ where: { status: "SUSPENDED" } }),
      prisma.property.count({ where: { status: "REJECTED" } }),
      prisma.property.count({ where: { propertyType: "HOTEL" } }),
      prisma.property.count({ where: { propertyType: "RESORT" } }),
      prisma.property.count({ where: { propertyType: "HOMESTAY" } }),
      prisma.property.count({ where: { propertyType: "HOUSEBOAT" } }),
    ]);

    return {
      total,
      pendingApprovals,
      liveListings,
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
    console.error("Error in getAdminListingsStats:", error);
    return {
      total: 0,
      pendingApprovals: 0,
      liveListings: 0,
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
