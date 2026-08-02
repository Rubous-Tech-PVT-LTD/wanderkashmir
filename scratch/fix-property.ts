import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findFirst({
    where: { name: "Panun Ghar Resort" }
  });

  if (property && property.description?.endsWith('"')) {
    const updatedDesc = property.description.slice(0, -1);
    await prisma.property.update({
      where: { id: property.id },
      data: { description: updatedDesc }
    });
    console.log("Fixed description for Panun Ghar Resort");
  } else {
    console.log("No fix needed");
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
