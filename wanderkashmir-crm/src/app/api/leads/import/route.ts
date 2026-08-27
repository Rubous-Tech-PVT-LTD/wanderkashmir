import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leads } = await request.json();
    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 });
    }

    let imported = 0;
    let failed = 0;
    const failedRows: any[] = [];

    // Pre-fetch all existing leads for the provided phones to optimize duplicate checks
    const phones = leads.map(l => l.phone).filter(Boolean);
    const existingLeads = await prisma.crmLead.findMany({
      where: {
        phone: { in: phones }
      }
    });

    // Process one by one with fault tolerance
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const rowNumber = lead.rowNumber || (i + 1);

      try {
        if (!lead.phone) {
          failed++;
          failedRows.push({ rowNumber, companyName: lead.companyName, reason: "Missing phone number" });
          continue;
        }

        // Application level duplicate detection
        // Rule: Check if a lead already exists with the same Phone AND (Email OR Company OR Website)
        const matchedPhones = existingLeads.filter(ex => ex.phone === lead.phone);
        let isDuplicate = false;
        
        for (const ex of matchedPhones) {
          if (
            (lead.email && ex.email?.toLowerCase() === lead.email.toLowerCase()) || 
            (lead.companyName && ex.companyName.toLowerCase() === lead.companyName.toLowerCase()) ||
            (lead.website && ex.website?.toLowerCase() === lead.website.toLowerCase())
          ) {
            isDuplicate = true;
            break;
          }
        }

        if (isDuplicate) {
          failed++;
          failedRows.push({ rowNumber, companyName: lead.companyName, reason: "Duplicate lead detected" });
          continue;
        }

        // Apply Role-based rules
        let assignedBaId = lead.assignedBaId;
        let createdBy = session.userId;
        let status = lead.status || 'NEW';

        if (session.role === 'BUSINESS_ASSOCIATE') {
          assignedBaId = session.userId;
          status = 'NEW';
        } else if (session.role === 'CRM_ADMIN') {
          // Admin can use whatever was passed, or leave it unassigned
        }

        // Prepare data
        const leadData = {
          companyName: lead.companyName || 'Unknown',
          contactPerson: lead.contactPerson || null,
          phone: lead.phone,
          whatsappNumber: lead.whatsappNumber || null,
          email: lead.email || null,
          city: lead.city || null,
          state: lead.state || null,
          website: lead.website || null,
          agentType: lead.agentType || null,
          source: lead.source || 'IMPORT',
          status: status,
          interestLevel: lead.interestLevel || null,
          notes: lead.notes || null,
          assignedBaId: assignedBaId || null,
          createdBy: createdBy,
        };

        if (lead.lastContactDate) {
          const parsedDate = new Date(lead.lastContactDate);
          if (!isNaN(parsedDate.getTime())) {
             (leadData as any).lastContactDate = parsedDate;
          }
        }
        
        if (lead.nextFollowUpDate) {
          const parsedDate = new Date(lead.nextFollowUpDate);
          if (!isNaN(parsedDate.getTime())) {
             (leadData as any).nextFollowUpDate = parsedDate;
          }
        }

        // Insert new lead
        const newLead = await prisma.crmLead.create({
          data: leadData
        });
        
        // Add to existingLeads to prevent duplicates within the same batch
        existingLeads.push(newLead);
        
        imported++;
      } catch (rowError: any) {
        console.error(`Error importing row ${rowNumber}:`, rowError);
        failed++;
        failedRows.push({ rowNumber, companyName: lead.companyName, reason: rowError.message || "Database constraint error" });
      }
    }

    return NextResponse.json({ imported, failed, failedRows });
  } catch (error: any) {
    console.error('Import batch error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
