import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let whereClause: any = {};
    if (user.role === "BUSINESS_ASSOCIATE") {
      whereClause.assignedBaId = user.id;
    }

    const partners = await prisma.crmPartner.findMany({
      where: whereClause,
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        phone: true,
      },
      orderBy: { companyName: "asc" }
    });

    return NextResponse.json(partners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
