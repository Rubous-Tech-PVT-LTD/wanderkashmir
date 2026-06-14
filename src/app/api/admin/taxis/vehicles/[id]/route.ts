import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, reason } = await req.json();

    let updatedData: any = {};

    if (action === "APPROVE") {
      updatedData = {
        isApproved: true,
        status: "LIVE",
        rejectionReason: null
      };
    } else if (action === "REJECT") {
      updatedData = {
        isApproved: false,
        status: "REJECTED",
        rejectionReason: reason || "Did not meet quality standards"
      };
    } else if (action === "SUSPEND") {
      updatedData = {
        isApproved: false,
        status: "SUSPENDED",
        rejectionReason: reason || "Suspended by admin"
      };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
