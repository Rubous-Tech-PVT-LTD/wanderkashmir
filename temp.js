const fs = require('fs');
function loadEnv(file) {
  if (fs.existsSync(file)) {
    const envConfig = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of envConfig) {
      if (line.includes('=')) {
        const parts = line.split('=');
        let val = parts.slice(1).join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[parts[0].trim()] = val;
      }
    }
  }
}
loadEnv('.env');
loadEnv('.env.local');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { email: { contains: 'bhatubaid341' } } });
  console.log("USER RECORD:");
  console.log(user);
}
main().finally(() => prisma.$disconnect());
