import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession, verifyAdminToken } from "@/lib/admin/auth";

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

    // Double check active, non-banned DB user
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true, isBanned: true },
    });
    if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
      return NextResponse.json({ error: "Forbidden: Account is not an active administrator." }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "ALL";
    const status = searchParams.get("status") || "ALL";

    const where: any = {};

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

    if (type !== "ALL" && type.trim()) {
      where.type = { equals: type.trim(), mode: "insensitive" };
    }

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

    const vehicles = await prisma.vehicle.findMany({
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
      take: 2000,
    });

    const headers = [
      "Vehicle ID",
      "Make",
      "Model",
      "Registration Number",
      "Type",
      "Seating Capacity",
      "Status",
      "Is Approved",
      "Rejection / Suspension Reason",
      "Commission Rate (%)",
      "Vendor Business Name",
      "Vendor Type",
      "Vendor Owner Name",
      "Vendor Email",
      "Vendor Phone",
      "Bookings Count",
      "Tour Transports Count",
      "Created Date",
    ];

    const rows = vehicles.map((v) => {
      const make = v.make === "Default" ? "" : v.make;
      const vendorUser = v.vendorProfile?.user;
      const email = v.vendorProfile?.email || vendorUser?.email || "";
      const phone = v.vendorProfile?.phone || vendorUser?.phone || "";
      const ownerName = vendorUser?.name || "";

      return [
        escapeCsvField(v.id),
        escapeCsvField(make),
        escapeCsvField(v.model),
        escapeCsvField(v.registrationNum),
        escapeCsvField(v.type),
        escapeCsvField(v.capacity),
        escapeCsvField(v.status),
        escapeCsvField(v.isApproved ? "YES" : "NO"),
        escapeCsvField(v.rejectionReason || ""),
        escapeCsvField(v.platformCommissionRate),
        escapeCsvField(v.vendorProfile?.businessName || ""),
        escapeCsvField(v.vendorProfile?.type || ""),
        escapeCsvField(ownerName),
        escapeCsvField(email),
        escapeCsvField(phone),
        escapeCsvField(v._count.bookings),
        escapeCsvField(v._count.tourTransports),
        escapeCsvField(new Date(v.createdAt).toISOString().split("T")[0]),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="wanderkashmir-vehicles-${dateStr}.csv"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating vehicles CSV export:", error);
    return NextResponse.json({ error: "Failed to generate CSV export." }, { status: 500 });
  }
}
