import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmAdmin, getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireCrmAdmin();
    
    // Fetch active batches
    const batches = await prisma.crmRotationBatch.findMany({
      where: {
        // active batches are where currentRotation < maxRotations
        // and there's actually leads assigned to it
      },
      include: {
        _count: {
          select: { leads: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ batches });
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
    const { baIds, maxRotations, includePartners } = await req.json();

    if (!Array.isArray(baIds) || baIds.length < 2) {
      return NextResponse.json({ error: "At least 2 BAs required for rotation" }, { status: 400 });
    }

    const maxR = typeof maxRotations === 'number' ? maxRotations : baIds.length;

    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(99999)`;

      // 1. Create the new Batch
      const batch = await tx.crmRotationBatch.create({
        data: {
          selectedBaIds: baIds,
          includePartners: !!includePartners,
          currentRotation: 1, // It's immediately rotated once!
          maxRotations: maxR
        }
      });

      // 2. Find eligible leads
      let whereClause: any = { 
        assignedBaId: { in: baIds }
      };
      
      if (!includePartners) {
        whereClause.status = {
          notIn: [
            "PARTNER_REGISTERED", 
            "REQUIREMENT_RECEIVED", 
            "QUOTE_SENT", 
            "NEGOTIATION", 
            "BOOKED", 
            "COMPLETED"
          ]
        };
      }

      const leads = await tx.crmLead.findMany({
        where: whereClause,
        select: { id: true, assignedBaId: true }
      });

      if (leads.length === 0) {
        throw new Error("No eligible leads found for selected BAs");
      }

      // 3. Calculate mapping
      let distribution: Record<string, number> = {};
      const updates = [];

      for (const lead of leads) {
        const currentIndex = baIds.indexOf(lead.assignedBaId!);
        const nextIndex = (currentIndex + 1) % baIds.length;
        const newBaId = baIds[nextIndex];
        
        updates.push({ id: lead.id, newBaId });
        distribution[`${lead.assignedBaId} -> ${newBaId}`] = (distribution[`${lead.assignedBaId} -> ${newBaId}`] || 0) + 1;
      }

      // 4. Execute updates
      for (const update of updates) {
        await tx.crmLead.update({
          where: { id: update.id },
          data: {
            assignedBaId: update.newBaId,
            status: "NEW", // Reset status to NEW upon assignment
            rotationBatchId: batch.id
          }
        });
      }

      // 5. Audit Log
      await tx.crmAuditLog.create({
        data: {
          userId: session.userId,
          userRole: session.role,
          action: "ROTATE_LEADS",
          entity: "CrmLead",
          entityId: batch.id,
          newValue: {
            batchId: batch.id,
            rotatedCount: updates.length,
            distribution,
            rotationNumber: 1,
            maxRotations: maxR,
            includePartners,
            isNewBatch: true
          }
        }
      });

      return { 
        success: true, 
        rotated: updates.length,
        distribution,
        batch
      };
    }, {
      timeout: 60000 
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Create rotation batch error:", error);
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
