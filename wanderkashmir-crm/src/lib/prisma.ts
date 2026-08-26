import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Ensure the CRM uses the CRM_DATABASE_URL if available, fallback to DATABASE_URL
export const prisma =
  global.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.CRM_DATABASE_URL || process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
