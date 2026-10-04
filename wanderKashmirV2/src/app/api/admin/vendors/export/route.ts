import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession, verifyAdminToken } from "@/lib/admin/auth";
import { VendorType } from "@prisma/client";

function escapeCsvField(val: string | number | null | undefined): string {
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
        { businessName: { contains: q, mode: "insensitive" } },
        { vendorId: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (type !== "ALL") {
      const upperType = type.toUpperCase();
      if (["HOTEL", "HOMESTAY", "TAXI", "GUIDE"].includes(upperType)) {
        where.type = upperType as VendorType;
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
      } else if (upperStatus === "REJECTED") {
        where.status = "REJECTED";
      } else if (upperStatus === "SUSPENDED") {
        where.status = "SUSPENDED";
      }
    }

    const vendors = await prisma.vendorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });

    const headers = [
      "Vendor ID",
      "Business Name",
      "Type",
      "Status",
      "Approved",
      "Owner Name",
      "Email",
      "Phone",
      "Alt Contact Person",
      "Alt Phone",
      "Address",
      "Bank Name",
      "Account Holder",
      "Account Number",
      "IFSC Code",
      "GST Number",
      "PAN Number",
      "Trade License",
      "Driving License",
      "Vehicle Reg",
      "Rejection Reason",
      "Registered Date",
    ];

    const rows = vendors.map((v) => [
      escapeCsvField(v.vendorId || "N/A"),
      escapeCsvField(v.businessName),
      escapeCsvField(v.type),
      escapeCsvField(v.status),
      escapeCsvField(v.isApproved ? "YES" : "NO"),
      escapeCsvField(v.user?.name || "N/A"),
      escapeCsvField(v.email || v.user?.email || "N/A"),
      escapeCsvField(v.phone || v.user?.phone || "N/A"),
      escapeCsvField(v.altContactPerson || "N/A"),
      escapeCsvField(v.altPhone || "N/A"),
      escapeCsvField(v.address || "N/A"),
      escapeCsvField(v.bankName || "N/A"),
      escapeCsvField(v.accountHolderName || "N/A"),
      escapeCsvField(v.accountNumber ? `'${v.accountNumber}` : "N/A"),
      escapeCsvField(v.ifscCode || "N/A"),
      escapeCsvField(v.gstNumber || "N/A"),
      escapeCsvField(v.panNumber || "N/A"),
      escapeCsvField(v.tradeLicense || "N/A"),
      escapeCsvField(v.drivingLicense || "N/A"),
      escapeCsvField(v.vehicleRegistration || "N/A"),
      escapeCsvField(v.rejectionReason || "N/A"),
      escapeCsvField(v.createdAt.toISOString().slice(0, 10)),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `wanderkashmir-vendors-${status.toLowerCase()}-${dateStr}.csv`;

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
    console.error("Error generating vendors CSV:", error);
    return NextResponse.json({ error: "Failed to generate CSV export." }, { status: 500 });
  }
}
