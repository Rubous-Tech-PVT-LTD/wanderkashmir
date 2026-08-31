require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const leads = await prisma.crmLead.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: { id: true, companyName: true, status: true, interestProofStatus: true, updatedAt: true }
  });
  console.log(leads);
}
main().finally(() => prisma.$disconnect());
