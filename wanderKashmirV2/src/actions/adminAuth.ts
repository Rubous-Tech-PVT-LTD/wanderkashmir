"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createAdminToken } from "@/lib/admin/auth";

/**
 * Server Action for Admin Login
 */
export async function loginAdminAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, email: true, password: true, role: true, name: true },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    if (user.role !== "ADMIN") {
      return { success: false, error: "Access denied. Administrator privileges required." };
    }

    if (!user.password) {
      return { success: false, error: "Password not set for this account. Contact system administrator." };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: "Invalid email or password." };
    }

    const token = await createAdminToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { success: false, error: "An unexpected error occurred during authentication." };
  }
}

/**
 * Server Action for Admin Logout
 */
export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "admin_session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  redirect("/admin/login");
}
