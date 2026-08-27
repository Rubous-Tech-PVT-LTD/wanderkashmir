import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireCrmAdmin();

    const history = await prisma.crmAuditLog.findMany({
      where: {
        action: {
          in: ["BULK_ASSIGN_LEADS", "ROTATE_LEADS"]
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20
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
      
      if (h.action === "ROTATE_LEADS") {
        // format is "A -> B"
        Object.keys(distribution).forEach(key => {
          const [oldId, newId] = key.split(' -> ');
          const oldName = baMap[oldId] || oldId;
          const newName = baMap[newId] || newId;
          namedDistribution[`${oldName} -> ${newName}`] = distribution[key];
        });
      } else {
        Object.keys(distribution).forEach(baId => {
          namedDistribution[baMap[baId] || baId] = distribution[baId];
        });
      }

      return {
        id: h.id,
        createdAt: h.createdAt,
        adminName: adminMap[h.userId] || h.userId,
        mode: payload?.mode,
        action: h.action,
        totalAssigned: payload?.totalAssigned || payload?.rotatedCount || 0,
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
