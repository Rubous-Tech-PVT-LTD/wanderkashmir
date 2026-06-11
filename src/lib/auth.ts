import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "fallback-secret-for-development";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

export async function getVendorSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("vendor_session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

import { auth as clerkAuth } from "@clerk/nextjs/server";

export async function getCurrentUserId(): Promise<string | null> {
  // First check if it's an admin
  const adminSession = await getAdminSession();
  if (adminSession?.userId) return adminSession.userId;

  // Then check if it's a vendor
  const vendorSession = await getVendorSession();
  if (vendorSession?.userId) return vendorSession.userId;

  // Fallback to clerk
  const { userId } = await clerkAuth();
  return userId;
}
