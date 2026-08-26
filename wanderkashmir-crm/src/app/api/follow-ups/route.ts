import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, partnerId, task, dueDate, notes } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }
    if (!task) {
      return NextResponse.json({ error: 'task is required' }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ error: 'dueDate is required' }, { status: 400 });
    }

    // Check ownership
    const lead = await prisma.crmLead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (session.role === 'BUSINESS_ASSOCIATE' && lead.assignedBaId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const followUp = await prisma.crmFollowUp.create({
      data: {
        leadId,
        partnerId,
        baId: session.userId,
        task,
        dueDate: new Date(dueDate),
        notes,
        status: 'PENDING'
      }
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: session.userId,
        userRole: session.role,
        action: 'FOLLOW_UP_CREATED',
        entity: 'CrmFollowUp',
        entityId: followUp.id
      }
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error: unknown) {
    console.error('Failed to create follow-up:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
