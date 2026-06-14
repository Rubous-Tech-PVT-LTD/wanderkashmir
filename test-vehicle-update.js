const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "PENDING" }
  });
  console.log("Pending vehicles:", vehicles.map(v => v.id));

  if (vehicles.length > 0) {
    try {
      const updated = await prisma.vehicle.update({
        where: { id: vehicles[0].id },
        data: {
          isApproved: true,
          status: "LIVE",
          rejectionReason: null
        }
      });
      console.log("Update successful:", updated);
    } catch (e) {
      console.error("Update failed:", e);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
