import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill for Reached Leads...');

  const leadsToBackfill = await prisma.crmLead.findMany({
    where: {
      status: {
        in: ['NOT_INTERESTED', 'WRONG_NUMBER']
      },
      reachedLog: null,
      assignedBaId: {
        not: null
      }
    }
  });

  console.log(`Found ${leadsToBackfill.length} leads to backfill.`);

  let successCount = 0;
  let errorCount = 0;

  for (const lead of leadsToBackfill) {
    try {
      if (!lead.assignedBaId) continue;
      
      const lastCall = await prisma.crmCallLog.findFirst({
        where: { leadId: lead.id },
        orderBy: { createdAt: 'desc' }
      });

      await prisma.crmLeadReachedLog.upsert({
        where: { leadId: lead.id },
        create: {
          leadId: lead.id,
          baId: lead.assignedBaId,
          source: 'AUTOMATIC',
          remarks: lastCall?.notes || 'Backfilled from historic status'
        },
        update: {}
      });
      
      successCount++;
    } catch (e) {
      console.error(`Failed to backfill lead ${lead.id}:`, e);
      errorCount++;
    }
  }

  console.log(`Backfill complete. Success: ${successCount}, Errors: ${errorCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
