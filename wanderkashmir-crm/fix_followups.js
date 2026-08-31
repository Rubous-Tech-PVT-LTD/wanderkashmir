const { PrismaClient } = require('@prisma/client');

require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  // Find the last 3 completed follow-ups
  const followUps = await prisma.crmFollowUp.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    take: 3
  });
  
  console.log("Found recently completed follow-ups:", followUps.map(f => ({ id: f.id, task: f.task, completedAt: f.completedAt })));

  if (followUps.length > 0) {
    // Revert them to PENDING
    for (const f of followUps) {
      await prisma.crmFollowUp.update({
        where: { id: f.id },
        data: {
          status: 'PENDING',
          completedAt: null
        }
      });
      console.log(`Reverted follow-up ${f.id} to PENDING.`);
    }
  } else {
    console.log("No completed follow-ups found to revert.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
