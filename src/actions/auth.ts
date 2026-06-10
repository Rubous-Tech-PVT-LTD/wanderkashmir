"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerCustomer(data: z.infer<typeof registerSchema>) {
  try {
    const parsedData = registerSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "Invalid data provided." };
    }

    const { name, email, password } = parsedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: "Email is already registered." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER", // Default role
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error registering customer:", error);
    return { success: false, error: "Failed to create account." };
  }
}
