import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    // Generate token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    // Check if token exists for this identifier
    const existingToken = await prisma.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (existingToken) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: existingToken.token } },
      });
    }

    // Create new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send email
    const emailResult = await sendPasswordResetEmail(email, token);

    if (!emailResult.success) {
      console.error("Failed to send email", emailResult.error);
      return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password reset link sent successfully." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
