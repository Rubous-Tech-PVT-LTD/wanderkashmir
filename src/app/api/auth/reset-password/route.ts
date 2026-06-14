import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Find the token in the database
    const existingToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > new Date(existingToken.expires)) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Find the user by the identifier (email) in the token
    const user = await prisma.user.findUnique({
      where: { email: existingToken.identifier },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the token so it can't be used again
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
