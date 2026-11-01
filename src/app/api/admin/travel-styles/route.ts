import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const styles = await prisma.travelStyle.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        imageAlt: true,
        isActive: true,
        displayOrder: true,
      },
    });

    return NextResponse.json(styles);
  } catch (error: any) {
    console.error("Error fetching travel styles:", error);
    return NextResponse.json({ error: "Failed to fetch travel styles" }, { status: 500 });
  }
}
