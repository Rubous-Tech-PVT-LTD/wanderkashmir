const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_NufcLth5xKR3@ep-gentle-sun-ap5b6ph4.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

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
