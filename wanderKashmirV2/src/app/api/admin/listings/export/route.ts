import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession, verifyAdminToken } from "@/lib/admin/auth";
import { PropertyType } from "@prisma/client";

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

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "ALL";
    const status = searchParams.get("status") || "ALL";

    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { vendorProfile: { businessName: { contains: q, mode: "insensitive" } } },
        { vendorProfile: { vendorId: { contains: q, mode: "insensitive" } } },
        { vendorProfile: { user: { name: { contains: q, mode: "insensitive" } } } },
        { vendorProfile: { user: { email: { contains: q, mode: "insensitive" } } } },
      ];
    }

    if (type !== "ALL") {
      const upperType = type.toUpperCase();
      if (["HOTEL", "RESORT", "HOMESTAY", "HOUSEBOAT"].includes(upperType)) {
        where.propertyType = upperType as PropertyType;
      }
    }

    if (status !== "ALL") {
      const upperStatus = status.toUpperCase();
      if (upperStatus === "PENDING") {
        where.OR = [
          { status: "PENDING" },
          { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
        ];
      } else if (upperStatus === "APPROVED" || upperStatus === "LIVE") {
        where.isApproved = true;
        where.status = { notIn: ["SUSPENDED", "REJECTED"] };
      } else if (upperStatus === "SUSPENDED") {
        where.status = "SUSPENDED";
      } else if (upperStatus === "REJECTED") {
        where.status = "REJECTED";
      }
    }

    const properties = await prisma.property.findMany({
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
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });

    const headers = [
      "Property ID",
      "Property Name",
      "Property Type",
      "Status",
      "Approved",
      "Price Per Night",
      "Location",
      "Vendor Business",
      "Vendor Type",
      "Vendor ID",
      "Owner Name",
      "Owner Email",
      "Owner Phone",
      "Total Rooms",
      "Available Rooms",
      "Bedrooms",
      "Beds",
      "Guests Max",
      "Breakfast Included",
      "Dinner Included",
      "Google Place ID",
      "Rejection / Suspension Reason",
      "Created Date",
    ];

    const rows = properties.map((p) => [
      escapeCsvField(p.id),
      escapeCsvField(p.name),
      escapeCsvField(p.propertyType),
      escapeCsvField(p.status),
      escapeCsvField(p.isApproved ? "YES" : "NO"),
      escapeCsvField(p.pricePerNight),
      escapeCsvField(p.location),
      escapeCsvField(p.vendorProfile?.businessName || "N/A"),
      escapeCsvField(p.vendorProfile?.type || "N/A"),
      escapeCsvField(p.vendorProfile?.vendorId || "N/A"),
      escapeCsvField(p.vendorProfile?.user?.name || "N/A"),
      escapeCsvField(p.vendorProfile?.email || p.vendorProfile?.user?.email || "N/A"),
      escapeCsvField(p.vendorProfile?.phone || p.vendorProfile?.user?.phone || "N/A"),
      escapeCsvField(p.totalRooms),
      escapeCsvField(p.availableRooms),
      escapeCsvField(p.bedrooms),
      escapeCsvField(p.beds),
      escapeCsvField(p.guests),
      escapeCsvField(p.breakfastIncluded ? "YES" : "NO"),
      escapeCsvField(p.dinnerIncluded ? "YES" : "NO"),
      escapeCsvField(p.googlePlaceId || "N/A"),
      escapeCsvField(p.rejectionReason || "N/A"),
      escapeCsvField(p.createdAt.toISOString().slice(0, 10)),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `wanderkashmir-listings-${status.toLowerCase()}-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating listings CSV:", error);
    return NextResponse.json({ error: "Failed to generate CSV export." }, { status: 500 });
  }
}
