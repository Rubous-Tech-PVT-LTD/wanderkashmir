import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireCrmAdmin();

    const history = await prisma.crmAuditLog.findMany({
      where: {
        action: "BULK_ASSIGN_LEADS"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    });

    // Populate Admin names if necessary
    const adminIds = [...new Set(history.map(h => h.userId))];
    const admins = await prisma.crmUser.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, name: true }
    });
    
    const adminMap: Record<string, string> = {};
    admins.forEach(a => adminMap[a.id] = a.name);
    
    // Also fetch BA names for better display
    const allBAs = await prisma.crmUser.findMany({
      where: { role: "BUSINESS_ASSOCIATE" },
      select: { id: true, name: true }
    });
    
    const baMap: Record<string, string> = {};
    allBAs.forEach(b => baMap[b.id] = b.name);

    const formattedHistory = history.map(h => {
      const payload = h.newValue as any;
      const distribution = payload?.distribution || {};
      
      const namedDistribution: Record<string, number> = {};
      Object.keys(distribution).forEach(baId => {
        namedDistribution[baMap[baId] || baId] = distribution[baId];
      });

      return {
        id: h.id,
        createdAt: h.createdAt,
        adminName: adminMap[h.userId] || h.userId,
        mode: payload?.mode,
        totalAssigned: payload?.totalAssigned || 0,
        baCount: payload?.selectedBAs?.length || 0,
        distribution: namedDistribution,
        lastAssignedBaId: payload?.lastAssignedBaId
      };
    });

    return NextResponse.json(formattedHistory);
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
