const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const newPassword = "password123";
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email: "shadil78650@gmail.com" },
    data: { password: hashedPassword }
  });
  
  console.log("Password reset successfully to: " + newPassword);
}

main().catch(console.error).finally(() => prisma.$disconnect());
