const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const guide = await prisma.guideProfile.findFirst({
    where: { isApproved: true },
    orderBy: { pricePerDay: 'asc' }
  });
  console.log("Cheapest Guide:", guide?.pricePerDay);

  const taxi = await prisma.taxiRateCard.findFirst();
  console.log("Sample Taxi Rate Card:", taxi);
}

check().catch(console.error).finally(() => prisma.$disconnect());
