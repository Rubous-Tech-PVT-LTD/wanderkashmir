const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  try { 
    console.log('Finding user...');
    const dbUser = await prisma.user.findUnique({ where: { email: 'bhatubaid341@gmail.com' } });
    
    let userId = "";
    if (dbUser) {
        console.log('User exists');
        userId = dbUser.id;
    } else {
        console.log('Creating user...');
        const user = await prisma.user.create({ data: { email: 'bhatubaid341@gmail.com', password: 'test', name: 'Test Vendor', role: 'VENDOR' } }); 
        console.log('User created:', user.id); 
        userId = user.id;
    }

    console.log('Creating VP...');
    const vp = await prisma.vendorProfile.create({ data: { userId: userId, businessName: 'Test Business 2', type: 'HOTEL', isApproved: false, subscriptionPlan: 'FREE', email: 'bhatubaid341@gmail.com' } }); 
    console.log('Vendor Profile created:', vp.id); 
  } catch(e) { 
    console.error('Error string:', e.toString()); 
    console.error('Error message:', e.message);
  } finally { 
    await prisma.$disconnect(); 
  } 
} 
main();
