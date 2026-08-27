import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmAdmin, getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireCrmAdmin();

    const unassignedCount = await prisma.crmLead.count({
      where: {
        assignedBaId: null
      }
    });

    const activeBAs = await prisma.crmUser.findMany({
      where: {
        isActive: true,
        role: "BUSINESS_ASSOCIATE"
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      unassignedCount,
      activeBAs,
      currentAdminId: session.userId
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireCrmAdmin();

    const { baIds, mode, maxRotations } = await req.json();

    if (!Array.isArray(baIds) || baIds.length === 0) {
      return NextResponse.json({ error: "No BAs selected" }, { status: 400 });
    }

    if (mode !== "EQUAL" && mode !== "ROUND_ROBIN") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const maxR = typeof maxRotations === 'number' ? maxRotations : baIds.length;
    
    // Assign New Leads is only for UNASSIGNED leads
    const whereClause = { assignedBaId: null };

    // Use a transaction for safety and to support PostgreSQL advisory lock
    const result = await prisma.$transaction(async (tx) => {
      // Advisory lock to guarantee safe persistent rotation across concurrent requests
      // The lock ID is an arbitrary integer (e.g., 99999)
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(99999)`;

      const leadsToAssign = await tx.crmLead.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: { id: true, assignedBaId: true }
      });

      if (leadsToAssign.length === 0) {
        return { success: true, message: "No leads to assign", assigned: 0 };
      }

      const baCount = baIds.length;
      let distribution: Record<string, number> = {};
      baIds.forEach(id => distribution[id] = 0);
      
      const leadUpdates = [];
      let lastAssignedBaId = null;

      if (mode === "EQUAL") {
        // Equal Workload
        // We will just do a simple round-robin starting from index 0 for this batch
        // to ensure it is distributed perfectly evenly.
        for (let i = 0; i < leadsToAssign.length; i++) {
          const baId = baIds[i % baCount];
          leadUpdates.push({ id: leadsToAssign[i].id, baId });
          distribution[baId]++;
          lastAssignedBaId = baId;
        }
      } else {
        // Balanced Round-Robin
        // Fetch last assigned BA from CrmAuditLog
        const lastLog: any[] = await tx.$queryRaw`
          SELECT "newValue" 
          FROM "CrmAuditLog" 
          WHERE action = 'BULK_ASSIGN_LEADS' 
          ORDER BY "createdAt" DESC 
          LIMIT 1
        `;

        let startIndex = 0;
        if (lastLog.length > 0 && lastLog[0].newValue && lastLog[0].newValue.lastAssignedBaId) {
          const prevBaId = lastLog[0].newValue.lastAssignedBaId;
          const prevIndex = baIds.indexOf(prevBaId);
          if (prevIndex !== -1) {
            startIndex = (prevIndex + 1) % baCount;
          }
        }

        for (let i = 0; i < leadsToAssign.length; i++) {
          const baId = baIds[(startIndex + i) % baCount];
          leadUpdates.push({ id: leadsToAssign[i].id, baId });
          distribution[baId]++;
          lastAssignedBaId = baId;
        }
      }

      // Create the Rotation Batch to group this assignment
      const rotationBatch = await tx.crmRotationBatch.create({
        data: {
          selectedBaIds: baIds,
          includePartners: false,
          currentRotation: 0,
          maxRotations: maxR
        }
      });

      // Execute updates
      for (const update of leadUpdates) {
        await tx.crmLead.update({
          where: { id: update.id },
          data: {
            assignedBaId: update.baId,
            status: "NEW", // Reset status to NEW upon assignment
            rotationBatchId: rotationBatch.id
          }
        });
      }

      // Audit Log
      await tx.crmAuditLog.create({
        data: {
          userId: session.userId,
          userRole: session.role,
          action: "BULK_ASSIGN_LEADS",
          entity: "CrmLead",
          entityId: rotationBatch.id,
          newValue: {
            mode,
            totalAssigned: leadsToAssign.length,
            distribution,
            lastAssignedBaId,
            selectedBAs: baIds,
            rotationBatchId: rotationBatch.id
          }
        }
      });

      return { 
        success: true, 
        assigned: leadsToAssign.length,
        distribution
      };
    }, {
      timeout: 60000 // Increase timeout to 60s for large batches
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Bulk assign error:", error);
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
