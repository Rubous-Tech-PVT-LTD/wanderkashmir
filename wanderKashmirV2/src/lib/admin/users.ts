import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export interface AdminUserItem {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: Role;
  isBanned: boolean;
  banReason: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  bookingsCount: number;
  reviewsCount: number;
}

export interface AdminUserDetail extends AdminUserItem {
  bookings: Array<{
    id: string;
    status: string;
    amount: number;
    createdAt: Date;
    checkIn: Date | null;
    checkOut: Date | null;
  }>;
}

export interface GetAdminUsersParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "BANNED";
  role?: "ALL" | "CUSTOMER" | "VENDOR" | "ADMIN";
  page?: number;
  limit?: number;
}

export interface GetAdminUsersResult {
  users: AdminUserItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserStats {
  total: number;
  customers: number;
  vendors: number;
  admins: number;
  active: number;
  banned: number;
}

/**
 * Server-side query for user statistics across roles and status.
 */
export async function getAdminUserStats(): Promise<AdminUserStats> {
  try {
    const [total, customers, vendors, admins, active, banned] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "VENDOR" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { isBanned: false } }),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    return { total, customers, vendors, admins, active, banned };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { total: 0, customers: 0, vendors: 0, admins: 0, active: 0, banned: 0 };
  }
}

/**
 * Server-side paginated query for users with database search and status filters.
 * Excludes sensitive fields (password, tokens, etc.) from the result.
 */
export async function getAdminUsersList(
  params: GetAdminUsersParams = {}
): Promise<GetAdminUsersResult> {
  const { search = "", status = "ALL", role = "ALL", page = 1, limit = 15 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Status filtering
  if (status === "ACTIVE") {
    where.isBanned = false;
  } else if (status === "BANNED") {
    where.isBanned = true;
  }

  // Role filtering
  if (role !== "ALL" && ["CUSTOMER", "VENDOR", "ADMIN"].includes(role)) {
    where.role = role as Role;
  }

  // Database search across name, email, phone, and id
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { id: { equals: q } },
    ];
  }

  try {
    const [rawUsers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          isBanned: true,
          banReason: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const users: AdminUserItem[] = rawUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      image: u.image,
      role: u.role,
      isBanned: u.isBanned,
      banReason: u.banReason,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      bookingsCount: u._count.bookings,
      reviewsCount: u._count.reviews,
    }));

    return {
      users,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error fetching admin users list:", error);
    return {
      users: [],
      totalCount: 0,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Server-side query for a single user detail with recent booking aggregates.
 */
export async function getAdminUserById(id: string): Promise<AdminUserDetail | null> {
  try {
    const u = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isBanned: true,
        banReason: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
            checkIn: true,
            checkOut: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!u) return null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      image: u.image,
      role: u.role,
      isBanned: u.isBanned,
      banReason: u.banReason,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      bookingsCount: u._count.bookings,
      reviewsCount: u._count.reviews,
      bookings: u.bookings,
    };
  } catch (error) {
    console.error("Error fetching admin user by id:", error);
    return null;
  }
}
