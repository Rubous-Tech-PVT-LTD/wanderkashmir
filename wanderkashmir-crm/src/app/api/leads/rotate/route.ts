import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmAdmin, getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireCrmAdmin();
    const { batchId, includePartners } = await req.json();

    if (!batchId) {
      return NextResponse.json({ error: "Batch ID required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(99999)`;

      const batch = await tx.crmRotationBatch.findUnique({
        where: { id: batchId }
      });

      if (!batch) {
        throw new Error("Batch not found");
      }

      if (batch.currentRotation >= batch.maxRotations) {
        throw new Error("Maximum rotations reached for this batch");
      }

      const baIds = batch.selectedBaIds;
      if (baIds.length < 2) {
        throw new Error("Not enough BAs in batch to rotate");
      }

      // Find all leads in this batch
      let whereClause: any = { rotationBatchId: batch.id };
      
      if (!includePartners) {
        // Exclude converted or partner leads
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
        return { success: true, message: "No eligible leads to rotate in this batch", rotated: 0 };
      }

      // Calculate A -> B ownership mapping
      // If baIds = [A, B, C]
      // index 0 (A) -> index 1 (B)
      // index 1 (B) -> index 2 (C)
      // index 2 (C) -> index 0 (A)
      
      let distribution: Record<string, number> = {};
      const updates = [];

      for (const lead of leads) {
        if (!lead.assignedBaId) continue;
        
        const currentIndex = baIds.indexOf(lead.assignedBaId);
        if (currentIndex === -1) {
          // If the lead was somehow assigned to someone outside the pool, leave it, or push it back in?
          // The prompt says: "Do NOT rotate: leads assigned to BAs outside the selected pool"
          continue;
        }

        const nextIndex = (currentIndex + 1) % baIds.length;
        const newBaId = baIds[nextIndex];
        
        updates.push({ id: lead.id, oldBaId: lead.assignedBaId, newBaId });
        distribution[`${lead.assignedBaId} -> ${newBaId}`] = (distribution[`${lead.assignedBaId} -> ${newBaId}`] || 0) + 1;
      }

      // Execute updates
      for (const update of updates) {
        await tx.crmLead.update({
          where: { id: update.id },
          data: {
            assignedBaId: update.newBaId,
            status: "NEW", // Reset status to NEW upon assignment
          }
        });
      }

      const newRotationCount = batch.currentRotation + 1;
      
      // Update batch
      await tx.crmRotationBatch.update({
        where: { id: batch.id },
        data: { currentRotation: newRotationCount }
      });

      // Audit Log
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
            rotationNumber: newRotationCount,
            maxRotations: batch.maxRotations,
            includePartners
          }
        }
      });

      return { 
        success: true, 
        rotated: updates.length,
        newRotationCount,
        distribution
      };
    }, {
      timeout: 60000 
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Rotate error:", error);
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
