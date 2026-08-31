import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // In a global notification, mark it as read for everyone by updating the DB.
    // (In a more complex system we'd track read state per user for global notifications, 
    // but here we just mark it as read entirely or rely on individual BAs acting on it).
    // The user requested a simple system.

    const notification = await prisma.crmNotification.update({
      where: { id },
      data: { isRead: true }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
