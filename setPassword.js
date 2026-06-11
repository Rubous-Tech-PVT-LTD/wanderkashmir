import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Update bhatubaid341@gmail.com
  const updatedAdmin = await prisma.user.update({
    where: { email: 'bhatubaid341@gmail.com' },
    data: { password: passwordHash, role: 'ADMIN' }
  });

  console.log(`Updated password for ${updatedAdmin.email}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
