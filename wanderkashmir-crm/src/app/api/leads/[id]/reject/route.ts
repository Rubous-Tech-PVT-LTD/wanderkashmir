import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === 'BUSINESS_ASSOCIATE') {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 401 });
    }

    const { id: leadId } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // 1. Get Lead
    const lead = await prisma.crmLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.status !== 'INTERESTED') {
      return NextResponse.json({ error: 'Lead is not in a pending approval state' }, { status: 400 });
    }

    // 2. Perform Rejection updates within a transaction
    await prisma.$transaction(async (tx) => {
      // Update Lead Status back to CONNECTED and set interestProofStatus
      await tx.crmLead.update({
        where: { id: lead.id },
        data: { 
          status: 'CONNECTED',
          interestProofStatus: 'REJECTED' 
        }
      });

      // Create Call Log for transparency
      await tx.crmCallLog.create({
        data: {
          leadId: lead.id,
          baId: session.userId,
          outcome: 'PROOF_REJECTED',
          notes: `Admin rejected proof of interest. Reason: ${reason}`
        }
      });

      // If the lead is assigned to a BA, create a follow-up for them
      if (lead.assignedBaId) {
        await tx.crmFollowUp.create({
          data: {
            leadId: lead.id,
            baId: lead.assignedBaId,
            task: `Re-upload Proof of Interest. Admin notes: ${reason}`,
            dueDate: new Date(), // Due immediately
            status: 'PENDING'
          }
        });
      }

      // Create Audit Log
      await tx.crmAuditLog.create({
        data: {
          userId: session.userId,
          userRole: session.role,
          action: 'LEAD_PROOF_REJECTED',
          entity: 'CrmLead',
          entityId: lead.id,
          oldValue: { status: lead.status, interestProofStatus: lead.interestProofStatus } as any,
          newValue: { status: 'CONNECTED', interestProofStatus: 'REJECTED', reason } as any
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Failed to reject lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
