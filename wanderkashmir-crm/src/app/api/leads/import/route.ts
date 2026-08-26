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

    // Process one by one to handle application-level deduplication
    for (const lead of leads) {
      if (!lead.phone) {
        failed++;
        continue;
      }

      // Application level duplicate detection
      // Rule: Check if a lead already exists with the same Phone AND (Email OR Company)
      const existingLeads = await prisma.crmLead.findMany({
        where: {
          phone: lead.phone,
        }
      });

      let isDuplicate = false;
      for (const ex of existingLeads) {
        if (
          (lead.email && ex.email?.toLowerCase() === lead.email.toLowerCase()) || 
          (ex.companyName.toLowerCase() === lead.companyName.toLowerCase()) ||
          (lead.website && ex.website?.toLowerCase() === lead.website.toLowerCase())
        ) {
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) {
        failed++;
        continue;
      }

      // Insert new lead
      await prisma.crmLead.create({
        data: {
          companyName: lead.companyName || 'Unknown',
          contactPerson: lead.contactPerson,
          phone: lead.phone,
          email: lead.email,
          city: lead.city,
          state: lead.state,
          website: lead.website,
          source: 'IMPORT',
        }
      });
      imported++;
    }

    return NextResponse.json({ imported, failed });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
