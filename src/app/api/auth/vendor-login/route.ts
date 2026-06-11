import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || (user.role !== "VENDOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Invalid credentials or unauthorized" }, { status: 401 });
    }

    if (!user.password) {
       return NextResponse.json({ error: "Password not set. Please contact support." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const sessionToken = await encrypt(sessionData);

    const cookieStore = await cookies();
    cookieStore.set({
      name: "vendor_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vendor Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
