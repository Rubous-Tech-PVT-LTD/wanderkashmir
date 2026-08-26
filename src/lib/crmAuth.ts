import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Dummy auth stub for CRM APIs
// To be replaced with actual NextAuth or JWT logic when CRM auth is fully implemented

export async function getCrmUser(req: NextRequest) {
  // TEMPORARY MOCK FOR UI TESTING
  return {
    id: "mock-admin-id",
    role: "CRM_ADMIN",
    email: "admin@wanderkashmir.com",
    name: "Test Admin"
  };
}

export async function requireCrmAuth(req: NextRequest) {
  const user = await getCrmUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function isCrmAdminOrManager(role: string) {
  return role === "CRM_ADMIN" || role === "SALES_MANAGER" || role === "OPERATIONS";
}
