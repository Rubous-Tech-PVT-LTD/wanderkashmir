import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CRM_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 3) {
      return NextResponse.json({ leads: [], partners: [], requirements: [] });
    }

    const searchQuery = { contains: query, mode: "insensitive" as const };

    // Parallel search queries with limits for performance
    const [leads, partners, requirements] = await Promise.all([
      prisma.crmLead.findMany({
        where: {
          OR: [
            { companyName: searchQuery },
            { phone: { contains: query } },
            { email: searchQuery },
            { contactPerson: searchQuery }
          ]
        },
        select: { id: true, companyName: true, phone: true },
        take: 5
      }),
      prisma.crmPartner.findMany({
        where: {
          OR: [
            { companyName: searchQuery },
            { phone: { contains: query } },
            { email: searchQuery }
          ]
        },
        select: { id: true, companyName: true, city: true, state: true },
        take: 5
      }),
      prisma.crmRequirement.findMany({
        where: {
          OR: [
            { customerName: searchQuery },
            { customerPhone: { contains: query } },
            { customerEmail: searchQuery }
          ]
        },
        select: { id: true, customerName: true },
        take: 5
      })
    ]);

    return NextResponse.json({ leads, partners, requirements });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
