import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["CRM_ADMIN", "SALES_MANAGER", "OPERATIONS", "BUSINESS_ASSOCIATE"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireCrmAdmin();
    const id = (await params).id;

    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const updateData: any = { ...data };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    const updatedUser = await prisma.crmUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("User update error:", error);
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden - CRM_ADMIN required" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
