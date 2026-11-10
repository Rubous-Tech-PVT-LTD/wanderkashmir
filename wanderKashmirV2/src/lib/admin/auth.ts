import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type UserRole = "ADMIN" | "EDITOR" | "VENDOR" | "CUSTOMER" | string;

export interface AdminSession {
  userId: string;
  email: string;
  role: UserRole;
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
 * Returns raw verified session from cookie without enforcing a specific role.
 */
export async function getRawSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken) {
      return null;
    }

    return await verifyAdminToken(sessionToken);
  } catch {
    return null;
  }
}

/**
 * Server-side Admin Session verification.
 * Extracts and cryptographically verifies the HTTP-only admin_session cookie.
 * Confirms that the role is strictly "ADMIN".
 * Preserves 100% backward-compatibility for all existing admin-only callers.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getRawSession();
  if (!session || session.role !== "ADMIN") {
    return null;
  }
  return session;
}

/**
 * Server-side Editor or Admin Session verification.
 * Confirms that the role is either "ADMIN" or "EDITOR".
 */
export async function getAdminOrEditorSession(): Promise<AdminSession | null> {
  const session = await getRawSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return null;
  }
  return session;
}

/**
 * Strict Admin requirement helper.
 * Throws an Error if the user is not authenticated as ADMIN.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized: Strict Administrator privileges required.");
  }
  return session;
}

/**
 * Content Editor or Admin requirement helper.
 * Throws an Error if the user is not authenticated as ADMIN or EDITOR.
 */
export async function requireContentEditor(): Promise<AdminSession> {
  const session = await getAdminOrEditorSession();
  if (!session) {
    throw new Error("Unauthorized: Content Editor or Administrator privileges required.");
  }
  return session;
}

/**
 * Alias for requireContentEditor()
 */
export const requireAdminOrEditor = requireContentEditor;

/**
 * Role check helpers
 */
export function isStrictAdmin(role?: string | null): boolean {
  return role === "ADMIN";
}

export function isContentEditor(role?: string | null): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

export function isForbiddenAdminRole(role?: string | null): boolean {
  return !role || role === "VENDOR" || role === "CUSTOMER";
}
