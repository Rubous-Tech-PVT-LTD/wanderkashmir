import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: followUpId } = await params;
    const body = await request.json();
    const { action, newDate } = body;

    const followUp = await prisma.crmFollowUp.findUnique({
      where: { id: followUpId }
    });

    if (!followUp) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
    }

    if (session.role === 'BUSINESS_ASSOCIATE' && followUp.baId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'COMPLETE') {
      const updated = await prisma.crmFollowUp.update({
        where: { id: followUpId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      });
      
      await prisma.crmAuditLog.create({
        data: {
          userId: session.userId,
          userRole: session.role,
          action: 'FOLLOW_UP_COMPLETED',
          entity: 'CrmFollowUp',
          entityId: followUpId
        }
      });
      
      return NextResponse.json({ success: true, followUp: updated });
    } 
    
    if (action === 'RESCHEDULE') {
      if (!newDate) {
        return NextResponse.json({ error: 'newDate is required for rescheduling' }, { status: 400 });
      }

      // Mark original as rescheduled
      await prisma.crmFollowUp.update({
        where: { id: followUpId },
        data: { status: 'RESCHEDULED' }
      });

      // Create new follow up
      const newFollowUp = await prisma.crmFollowUp.create({
        data: {
          leadId: followUp.leadId,
          partnerId: followUp.partnerId,
          baId: followUp.baId,
          task: followUp.task,
          dueDate: new Date(newDate),
          status: 'PENDING',
          notes: followUp.notes
        }
      });

      await prisma.crmAuditLog.create({
        data: {
          userId: session.userId,
          userRole: session.role,
          action: 'FOLLOW_UP_RESCHEDULED',
          entity: 'CrmFollowUp',
          entityId: followUpId,
          newValue: { newFollowUpId: newFollowUp.id, newDate }
        }
      });

      return NextResponse.json({ success: true, followUp: newFollowUp });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Failed to update follow-up:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
