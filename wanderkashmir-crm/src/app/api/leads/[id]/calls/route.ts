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

    // Await the params to get the lead id
    const { id: leadId } = await params;
    const body = await request.json();
    const { outcome, notes, followUpDate, followUpTask } = body;

    if (!outcome) {
      return NextResponse.json({ error: 'Outcome is required' }, { status: 400 });
    }

    // 1. Verify lead exists and user has permission
    const lead = await prisma.crmLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check ownership if user is a normal BA
    if (session.role === 'BUSINESS_ASSOCIATE' && lead.assignedBaId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this lead' }, { status: 403 });
    }

    // 2. Create the Call Log
    const callLog = await prisma.crmCallLog.create({
      data: {
        leadId,
        baId: session.userId,
        outcome,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    // 3. Determine if lead status should change
    // Do NOT downgrade advanced statuses
    const advancedStatuses = [
      'PARTNER_REGISTERED',
      'REQUIREMENT_RECEIVED',
      'QUOTE_SENT',
      'NEGOTIATION',
      'BOOKED',
      'COMPLETED'
    ];
    
    let newStatus = lead.status;
    let shouldUpdateStatus = false;

    if (!advancedStatuses.includes(lead.status)) {
      if (outcome === 'CONNECTED') {
        newStatus = 'CONNECTED';
        shouldUpdateStatus = true;
      } else if (outcome === 'INTERESTED') {
        newStatus = 'INTERESTED';
        shouldUpdateStatus = true;
      } else if (outcome === 'NOT_INTERESTED') {
        newStatus = 'NOT_INTERESTED';
        shouldUpdateStatus = true;
      }
    }

    if (shouldUpdateStatus) {
      await prisma.crmLead.update({
        where: { id: leadId },
        data: { status: newStatus as import('@prisma/client').CrmLeadStatus },
      });
    }

    // 4. Create Follow-up if requested
    let followUp = null;
    if (followUpDate) {
      followUp = await prisma.crmFollowUp.create({
        data: {
          leadId,
          baId: session.userId,
          dueDate: new Date(followUpDate),
          task: followUpTask || `Follow-up from ${outcome} call`,
        }
      });
    }

    // 5. Create Audit Log
    await prisma.crmAuditLog.create({
      data: {
        userId: session.userId,
        userRole: session.role || 'USER',
        action: 'CALL_LOGGED',
        entity: 'CrmLead',
        entityId: leadId,
        newValue: { outcome, notes, hasFollowUp: !!followUpDate },
      }
    });

    return NextResponse.json({ success: true, callLog, followUp });
  } catch (error: any) {
    console.error('Failed to log call:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
