import prisma from './src/lib/prisma';
async function main() {
  const p = await prisma.property.findFirst({
    where: { name: { contains: 'Peer Homestay' } }
  });
  console.log(JSON.stringify(p?.images));
}
main();
