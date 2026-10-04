import prisma from "@/lib/prisma";

export interface AdminVehicleItem {
  id: string;
  vendorProfileId: string;
  make: string;
  model: string;
  registrationNum: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean;
  rejectionReason: string | null;
  status: string;
  capacity: number;
  images: string[];
  isCommissionPercentage: boolean;
  platformCommissionRate: number;
  vendorProfile: {
    id: string;
    businessName: string;
    type: string;
    vendorId: string | null;
    email: string | null;
    phone: string | null;
    isApproved: boolean;
    status: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  };
  bookingsCount: number;
  tourTransportsCount: number;
}

export interface GetAdminVehiclesParams {
  search?: string;
  status?: "ALL" | "PENDING" | "APPROVED" | "LIVE" | "SUSPENDED" | "REJECTED";
  type?: string;
  page?: number;
  limit?: number;
}

export interface GetAdminVehiclesResult {
  vehicles: AdminVehicleItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminVehicleStats {
  total: number;
  pending: number;
  live: number;
  suspended: number;
  rejected: number;
}

export interface AdminRateCardItem {
  id: string;
  place: string;
  rates: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export const STANDARD_VEHICLE_TYPES = [
  "CRYSTA",
  "INNOVA",
  "ERTIGA",
  "TAVEERA",
  "ETIOS GLANZA",
  "SWIFT DZIRE",
  "ECCO",
  "ALTO K10",
  "SUMO",
  "BOLERO",
] as const;

/**
 * Server-side query for vehicle stats across all statuses.
 */
export async function getAdminVehicleStats(): Promise<AdminVehicleStats> {
  try {
    const [total, pending, live, suspended, rejected] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({
        where: {
          OR: [
            { status: "PENDING" },
            { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
          ],
        },
      }),
      prisma.vehicle.count({
        where: {
          OR: [
            { status: "LIVE" },
            { status: "APPROVED" },
            { isApproved: true, status: { notIn: ["REJECTED", "SUSPENDED"] } },
          ],
        },
      }),
      prisma.vehicle.count({
        where: { status: "SUSPENDED" },
      }),
      prisma.vehicle.count({
        where: { status: "REJECTED" },
      }),
    ]);

    return { total, pending, live, suspended, rejected };
  } catch (error) {
    console.error("Error fetching vehicle stats:", error);
    return { total: 0, pending: 0, live: 0, suspended: 0, rejected: 0 };
  }
}

/**
 * Server-side paginated query for vehicles with vendor context, search, and status filters.
 */
export async function getAdminVehiclesList(
  params: GetAdminVehiclesParams = {}
): Promise<GetAdminVehiclesResult> {
  const { search = "", status = "ALL", type = "ALL", page = 1, limit = 15 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Status filtering matching V1 semantics
  if (status !== "ALL") {
    const upperStatus = status.toUpperCase();
    if (upperStatus === "PENDING") {
      where.OR = [
        { status: "PENDING" },
        { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
      ];
    } else if (upperStatus === "APPROVED" || upperStatus === "LIVE") {
      where.OR = [
        { status: "LIVE" },
        { status: "APPROVED" },
        { isApproved: true, status: { notIn: ["REJECTED", "SUSPENDED"] } },
      ];
    } else if (upperStatus === "SUSPENDED") {
      where.status = "SUSPENDED";
    } else if (upperStatus === "REJECTED") {
      where.status = "REJECTED";
    }
  }

  // Type filter
  if (type !== "ALL" && type.trim()) {
    where.type = { equals: type.trim(), mode: "insensitive" };
  }

  // Search filtering
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { model: { contains: q, mode: "insensitive" } },
      { make: { contains: q, mode: "insensitive" } },
      { registrationNum: { contains: q, mode: "insensitive" } },
      { type: { contains: q, mode: "insensitive" } },
      { vendorProfile: { businessName: { contains: q, mode: "insensitive" } } },
      { vendorProfile: { user: { name: { contains: q, mode: "insensitive" } } } },
      { vendorProfile: { user: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  try {
    const [rawVehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
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
              isApproved: true,
              status: true,
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
              bookings: true,
              tourTransports: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
    ]);

    const vehicles: AdminVehicleItem[] = rawVehicles.map((v) => ({
      id: v.id,
      vendorProfileId: v.vendorProfileId,
      make: v.make === "Default" ? "" : v.make,
      model: v.model,
      registrationNum: v.registrationNum,
      type: v.type,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      isApproved: v.isApproved,
      rejectionReason: v.rejectionReason,
      status: v.status,
      capacity: v.capacity,
      images: v.images || [],
      isCommissionPercentage: v.isCommissionPercentage,
      platformCommissionRate: v.platformCommissionRate,
      vendorProfile: v.vendorProfile,
      bookingsCount: v._count.bookings,
      tourTransportsCount: v._count.tourTransports,
    }));

    return {
      vehicles,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error fetching admin vehicles list:", error);
    return {
      vehicles: [],
      totalCount: 0,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Server-side query for a single vehicle by ID with full details.
 */
export async function getAdminVehicleById(id: string): Promise<AdminVehicleItem | null> {
  try {
    const v = await prisma.vehicle.findUnique({
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
            isApproved: true,
            status: true,
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
            bookings: true,
            tourTransports: true,
          },
        },
      },
    });

    if (!v) return null;

    return {
      id: v.id,
      vendorProfileId: v.vendorProfileId,
      make: v.make === "Default" ? "" : v.make,
      model: v.model,
      registrationNum: v.registrationNum,
      type: v.type,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      isApproved: v.isApproved,
      rejectionReason: v.rejectionReason,
      status: v.status,
      capacity: v.capacity,
      images: v.images || [],
      isCommissionPercentage: v.isCommissionPercentage,
      platformCommissionRate: v.platformCommissionRate,
      vendorProfile: v.vendorProfile,
      bookingsCount: v._count.bookings,
      tourTransportsCount: v._count.tourTransports,
    };
  } catch (error) {
    console.error("Error fetching vehicle by id:", error);
    return null;
  }
}

/**
 * Server-side paginated query for taxi rate cards.
 */
export async function getAdminRateCardsList(params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  rateCards: AdminRateCardItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { search = "", page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search && search.trim()) {
    where.place = { contains: search.trim(), mode: "insensitive" };
  }

  try {
    const [rawCards, totalCount] = await Promise.all([
      prisma.taxiRateCard.findMany({
        where,
        orderBy: { place: "asc" },
        skip,
        take: limit,
      }),
      prisma.taxiRateCard.count({ where }),
    ]);

    const rateCards: AdminRateCardItem[] = rawCards.map((rc) => ({
      id: rc.id,
      place: rc.place,
      rates: (rc.rates && typeof rc.rates === "object" ? rc.rates : {}) as Record<string, number>,
      createdAt: rc.createdAt,
      updatedAt: rc.updatedAt,
    }));

    return {
      rateCards,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error fetching taxi rate cards:", error);
    return {
      rateCards: [],
      totalCount: 0,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
}
