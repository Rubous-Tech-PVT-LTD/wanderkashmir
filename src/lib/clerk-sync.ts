import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Ensures the currently logged-in Clerk user exists in the Prisma User table.
 * Returns the userId.
 */
export async function ensureDbUser(userId: string) {
  const existingDbUser = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!existingDbUser) {
    const user = await currentUser();
    if (!user) throw new Error("Clerk user not found");

    await prisma.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`,
        name: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Indiahiles User",
        role: "CUSTOMER"
      }
    });
  }
  
  return userId;
}
