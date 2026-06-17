"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/auth";

const checkAdmin = async () => {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
};

export async function getPaginatedVendors(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
}) {
  await checkAdmin();
  const { page, limit, search = "", status = "ALL", type = "ALL" } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (type !== "ALL") {
    where.type = type;
  }

  if (status === "PENDING") {
    where.isApproved = false;
    where.status = { not: "REJECTED" };
  } else if (status === "APPROVED") {
    where.isApproved = true;
  } else if (status === "SUSPENDED") {
    where.status = "SUSPENDED";
  } else if (status === "REJECTED") {
    where.status = "REJECTED";
  }

  const [data, totalCount] = await Promise.all([
    prisma.vendorProfile.findMany({
      where,
      include: {
        user: { select: { name: true } },
        properties: { select: { name: true, latitude: true, longitude: true, pricePerNight: true }, take: 1 },
        guideProfiles: { select: { pricePerDay: true }, take: 1 }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vendorProfile.count({ where }),
  ]);

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getPaginatedProperties(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  await checkAdmin();
  const { page, limit, search = "", status = "ALL" } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { vendorProfile: { businessName: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status === "PENDING") {
    where.isApproved = false;
    where.status = { not: "REJECTED" };
  } else if (status === "APPROVED") {
    where.isApproved = true;
  } else if (status === "SUSPENDED") {
    where.status = "SUSPENDED";
  } else if (status === "REJECTED") {
    where.status = "REJECTED";
  }

  const [data, totalCount] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        vendorProfile: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getPaginatedUsers(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  await checkAdmin();
  const { page, limit, search = "", status = "ALL" } = params;

  const where: any = { role: { not: "ADMIN" } };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "ACTIVE") {
    where.isBanned = false;
  } else if (status === "BANNED") {
    where.isBanned = true;
  }

  const [data, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getPaginatedBookings(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
  dateFilter?: string;
}) {
  await checkAdmin();
  const { page, limit, search = "", status = "ALL", type = "ALL", dateFilter = "ALL" } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status !== "ALL") {
    where.status = status;
  }

  if (type !== "ALL") {
    // We only filter by vendor type if explicitly requested
    // This requires a more complex query, so for now we'll do our best
    where.OR = [
      { property: { vendorProfile: { type } } },
      { vehicle: { vendorProfile: { type } } }
    ];
  }

  if (dateFilter === "TODAY") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    where.checkIn = { gte: todayStart, lte: todayEnd };
  } else if (dateFilter === "TOMORROW") {
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);
    where.checkIn = { gte: tomorrowStart, lte: tomorrowEnd };
  }

  const [data, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        property: { select: { name: true, vendorProfile: { select: { businessName: true, type: true } } } },
        vehicle: { select: { make: true, model: true, vendorProfile: { select: { businessName: true, type: true } } } },
        tour: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getPaginatedTours(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  await checkAdmin();
  const { page, limit, search = "", status = "ALL" } = params;

  const where: any = {};

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (status === "PENDING") {
    where.isApproved = false;
    where.status = { not: "REJECTED" };
  } else if (status === "APPROVED") {
    where.isApproved = true;
  } else if (status === "SUSPENDED") {
    where.status = "SUSPENDED";
  }

  const [data, totalCount] = await Promise.all([
    prisma.tour.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tour.count({ where }),
  ]);

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getPaginatedTaxis(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  await checkAdmin();
  const { page, limit, search = "", status = "ALL" } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { make: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { registrationNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "PENDING") {
    where.isApproved = false;
    where.status = { not: "REJECTED" };
  } else if (status === "APPROVED") {
    where.isApproved = true;
  } else if (status === "SUSPENDED") {
    where.status = "SUSPENDED";
  }

  const [data, totalCount] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: {
        vendorProfile: {
          select: { businessName: true, user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getPaginatedTaxiRates({ page = 1, limit = 10, search = '' }: { page?: number, limit?: number, search?: string }) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

    const skip = (page - 1) * limit;
    
    const whereClause: Prisma.TaxiRateCardWhereInput = search
      ? { place: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, totalCount] = await Promise.all([
      prisma.taxiRateCard.findMany({
        where: whereClause,
        orderBy: { place: 'asc' },
        skip,
        take: limit,
      }),
      prisma.taxiRateCard.count({ where: whereClause })
    ]);

    return {
      success: true,
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('Failed to fetch paginated taxi rates', error);
    throw new Error('Failed to fetch paginated taxi rates');
  }
}
