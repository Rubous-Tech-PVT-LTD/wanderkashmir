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
    const { outcome, notes, followUpDate, followUpTask, interestProof } = body;

    if (!outcome) {
      return NextResponse.json({ error: 'Outcome is required' }, { status: 400 });
    }

    const isDirectComplete = outcome === 'Not Interested' || outcome === 'Wrong Number' || outcome === 'NOT_INTERESTED' || outcome === 'WRONG_NUMBER';

    if (isDirectComplete && (!notes || notes.trim() === '')) {
      return NextResponse.json({ error: 'Internal Notes are mandatory for this outcome' }, { status: 400 });
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
      } else if (outcome === 'NOT_INTERESTED' || outcome === 'Not Interested') {
        newStatus = 'NOT_INTERESTED';
        shouldUpdateStatus = true;
      } else if (outcome === 'WRONG_NUMBER' || outcome === 'Wrong Number') {
        newStatus = 'WRONG_NUMBER';
        shouldUpdateStatus = true;
      }
    }

    if (shouldUpdateStatus) {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'INTERESTED' && interestProof) {
        updateData.interestProofUrl = interestProof;
        updateData.interestProofStatus = 'PENDING';
      }

      await prisma.crmLead.update({
        where: { id: leadId },
        data: updateData,
      });
    }

    // 4. Handle Reached/Follow-up Logic
    let followUp = null;
    
    if (isDirectComplete) {
      // Create AUTOMATIC Reached Log
      await prisma.crmLeadReachedLog.upsert({
        where: { leadId },
        create: {
          leadId,
          baId: session.userId,
          source: 'AUTOMATIC',
          remarks: notes,
        },
        update: {
          source: 'AUTOMATIC',
          remarks: notes,
        }
      });
      // Ensure no follow-up is created
    } else if (followUpDate) {
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
