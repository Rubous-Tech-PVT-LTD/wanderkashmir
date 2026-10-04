import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession, verifyAdminToken } from "@/lib/admin/auth";
import { Role } from "@prisma/client";

function escapeCsvField(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get("admin_session")?.value;
    let session = cookieToken ? await verifyAdminToken(cookieToken) : null;
    if (!session) {
      session = await getAdminSession().catch(() => null);
    }
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // Verify active, non-banned DB user
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true, isBanned: true },
    });
    if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
      return NextResponse.json(
        { error: "Forbidden: Account is not an active administrator." },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const role = searchParams.get("role") || "ALL";

    const where: any = {};

    if (status === "ACTIVE") {
      where.isBanned = false;
    } else if (status === "BANNED") {
      where.isBanned = true;
    }

    if (role !== "ALL" && ["CUSTOMER", "VENDOR", "ADMIN"].includes(role)) {
      where.role = role as Role;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { id: { equals: q } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });

    const headers = [
      "User ID",
      "Name",
      "Email",
      "Phone",
      "Role",
      "Status",
      "Ban Reason",
      "Bookings Count",
      "Reviews Count",
      "Joined Date",
    ];

    const rows = users.map((u) => {
      const statusText = u.isBanned ? "BANNED" : "ACTIVE";
      const joinedDate = new Date(u.createdAt).toISOString().replace("T", " ").substring(0, 19);

      return [
        escapeCsvField(u.id),
        escapeCsvField(u.name || "N/A"),
        escapeCsvField(u.email),
        escapeCsvField(u.phone || "N/A"),
        escapeCsvField(u.role),
        escapeCsvField(statusText),
        escapeCsvField(u.banReason || ""),
        escapeCsvField(u._count.bookings),
        escapeCsvField(u._count.reviews),
        escapeCsvField(joinedDate),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="wanderkashmir-users-${dateStr}.csv"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error exporting users CSV:", error);
    return NextResponse.json({ error: "Failed to generate CSV export." }, { status: 500 });
  }
}
