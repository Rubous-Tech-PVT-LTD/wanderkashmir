import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface AdminSession {
  userId: string;
  email: string;
  role: string;
  name?: string | null;
}

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  const key = getJwtSecretKey();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const key = getJwtSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    if (!payload || typeof payload !== "object") {
      return null;
    }

    const { userId, email, role } = payload as Record<string, unknown>;

    if (typeof userId !== "string" || typeof email !== "string" || typeof role !== "string") {
      return null;
    }

    return {
      userId,
      email,
      role,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side Admin Session verification.
 * Extracts and cryptographically verifies the HTTP-only admin_session cookie.
 * Confirms that the role is strictly "ADMIN".
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await verifyAdminToken(sessionToken);
    if (!session || session.role !== "ADMIN") {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
