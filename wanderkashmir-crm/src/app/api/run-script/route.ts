import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bas = await prisma.crmUser.findMany({
      where: { role: 'BUSINESS_ASSOCIATE' }
    });

    let count = 0;
    for (const ba of bas) {
      await prisma.crmLead.create({
        data: {
          companyName: `Dummy Lead for ${ba.name}`,
          contactPerson: 'Dummy Contact',
          phone: '0000000000',
          email: 'dummy@example.com',
          city: 'Test City',
          status: 'ASSIGNED',
          assignedBaId: ba.id,
          source: 'System Script'
        }
      });
      count++;
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
