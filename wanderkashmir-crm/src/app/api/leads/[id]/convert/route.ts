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

    // 1. Get Lead
    const lead = await prisma.crmLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // 2. Check Ownership/Permissions
    if (session.role === 'BUSINESS_ASSOCIATE' && lead.assignedBaId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this lead' }, { status: 403 });
    }

    // 3. Duplicate Protection
    const duplicateChecks: Record<string, unknown>[] = [
      { phone: lead.phone }
    ];
    
    if (lead.email) duplicateChecks.push({ email: lead.email });
    if (lead.website) duplicateChecks.push({ website: lead.website });
    if (lead.companyName && lead.city) {
      duplicateChecks.push({ 
        companyName: lead.companyName, 
        city: lead.city 
      });
    }

    const existingPartner = await prisma.crmPartner.findFirst({
      where: {
        OR: duplicateChecks
      }
    });

    if (existingPartner) {
      return NextResponse.json(
        { error: 'Partner already exists with matching details.', partnerId: existingPartner.id },
        { status: 409 }
      );
    }

    // 4. Create Partner and Update Lead
    const partner = await prisma.$transaction(async (tx) => {
      // Create Partner
      const newPartner = await tx.crmPartner.create({
        data: {
          leadId: lead.id,
          companyName: lead.companyName,
          contactPerson: lead.contactPerson,
          phone: lead.phone,
          email: lead.email,
          website: lead.website,
          city: lead.city,
          state: lead.state,
          agentType: lead.agentType,
          assignedBaId: lead.assignedBaId,
          notes: lead.notes,
          status: 'ACTIVE'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      });

      // Update Lead Status
      await tx.crmLead.update({
        where: { id: lead.id },
        data: { status: 'PARTNER_REGISTERED' }
      });

      // Create Audit Log
      await tx.crmAuditLog.create({
        data: {
          userId: session.userId,
          userRole: session.role || 'USER',
          action: 'LEAD_CONVERTED_TO_PARTNER',
          entity: 'CrmPartner',
          entityId: newPartner.id,
          oldValue: { status: lead.status },
          newValue: { status: 'PARTNER_REGISTERED', partnerId: newPartner.id }
        }
      });

      return newPartner;
    });

    return NextResponse.json({ success: true, partner });
  } catch (error: unknown) {
    console.error('Failed to convert lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
