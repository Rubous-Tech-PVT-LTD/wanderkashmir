import { cache } from "react";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const getJwtSecret = () => {
  const secret = process.env.CRM_JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error("Missing CRM_JWT_SECRET environment variable");
  }
  return new TextEncoder().encode(secret);
};

export interface CrmJwtPayload {
  userId: string;
  role: string;
  email: string;
}

export async function signToken(payload: CrmJwtPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // 24 hours expiry
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<CrmJwtPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return verified.payload as unknown as CrmJwtPayload;
  } catch (err) {
    return null;
  }
}

// Cached internal function that executes the database query once per request lifecycle
const getActiveUser = cache(async (userId: string) => {
  const user = await prisma.crmUser.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    }
  });
  return user;
});

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_token")?.value;
  
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Real-time database check to verify if the user is still ACTIVE
  // React.cache ensures this DB call happens once per request lifecycle
  const user = await getActiveUser(payload.userId);

  if (!user || !user.isActive) {
    return null;
  }

  return {
    ...user,
    userId: user.id, // For backwards compatibility with old session mock
  };
}

export async function requireCrmAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED"); // Caller should handle this (e.g., return 401 response)
  }
  return session;
}

export async function requireCrmAdmin() {
  const session = await requireCrmAuth();
  if (session.role !== "CRM_ADMIN") {
    throw new Error("FORBIDDEN"); // Caller should handle this (e.g., return 403 response)
  }
  return session;
}
