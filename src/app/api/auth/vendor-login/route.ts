import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const identifier = email?.trim(); // could be email or vendorId like WK-75182

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email / Vendor ID and password are required" }, { status: 400 });
    }

    let user = null;

    // Check if identifier looks like a Vendor ID (starts with WK-)
    if (identifier.toUpperCase().startsWith("WK-")) {
      const vendorProfile = await prisma.vendorProfile.findFirst({
        where: { vendorId: identifier.toUpperCase() },
        include: { user: true }
      });
      user = vendorProfile?.user ?? null;
    } else {
      user = await prisma.user.findUnique({ where: { email: identifier } });
    }

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

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { isApproved: true, status: true, rejectionReason: true, businessName: true, email: true }
    });

    return NextResponse.json({ 
      success: true,
      isApproved: vendorProfile?.isApproved ?? false,
      status: vendorProfile?.status ?? "PENDING",
      rejectionReason: vendorProfile?.rejectionReason ?? null,
      businessName: vendorProfile?.businessName ?? null,
      vendorEmail: vendorProfile?.email ?? user.email,
    });
  } catch (error) {
    console.error("Vendor Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
