import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireCrmAdmin } from "@/lib/auth";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  role: z.enum(["CRM_ADMIN", "SALES_MANAGER", "OPERATIONS", "BUSINESS_ASSOCIATE"]),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    await requireCrmAdmin();
    
    const users = await prisma.crmUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        joiningDate: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden - CRM_ADMIN required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireCrmAdmin();

    const body = await req.json();
    const data = createUserSchema.parse(body);

    const existingUser = await prisma.crmUser.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.crmUser.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("User creation error:", error);
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden - CRM_ADMIN required" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
