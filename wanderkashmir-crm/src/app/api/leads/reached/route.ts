import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const baId = searchParams.get('baId');

    let whereClause: any = {};

    if (session.role === 'BUSINESS_ASSOCIATE') {
      whereClause.baId = session.userId;
    } else if (session.role === 'CRM_ADMIN' && baId && baId !== 'ALL') {
      whereClause.baId = baId;
    }

    const reachedLeads = await prisma.crmLeadReachedLog.findMany({
      where: whereClause,
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            status: true,
            phone: true,
          }
        },
        ba: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        reachedAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: reachedLeads });
  } catch (error: any) {
    console.error('Failed to fetch reached leads:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
