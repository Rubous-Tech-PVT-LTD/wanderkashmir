import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leadId } = await params;
    const body = await request.json();
    const { remarks } = body;

    // Verify lead exists and user has permission
    const lead = await prisma.crmLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (session.role === 'BUSINESS_ASSOCIATE' && lead.assignedBaId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this lead' }, { status: 403 });
    }

    // Upsert the reached log
    const reachedLog = await prisma.crmLeadReachedLog.upsert({
      where: { leadId },
      create: {
        leadId,
        baId: session.userId,
        source: 'MANUAL',
        remarks,
      },
      update: {
        source: 'MANUAL',
        remarks,
      }
    });

    // Create Audit Log
    await prisma.crmAuditLog.create({
      data: {
        userId: session.userId,
        userRole: session.role || 'USER',
        action: 'MARKED_AS_REACHED',
        entity: 'CrmLead',
        entityId: leadId,
        newValue: { source: 'MANUAL', remarks },
      }
    });

    // If there is an active pending follow-up, mark it as completed
    await prisma.crmFollowUp.updateMany({
      where: { leadId, status: 'PENDING' },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });

    return NextResponse.json({ success: true, reachedLog });
  } catch (error: any) {
    console.error('Failed to mark lead as reached:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
