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
    const limit = Number(searchParams.get("limit")) || 20;
    const page = Number(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    const experiences = await prisma.experience.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.experience.count();

    return NextResponse.json({
      data: experiences,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error: any) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      destination,
      duration,
      basePrice,
      images,
      status,
    } = body;

    const experience = await prisma.experience.create({
      data: {
        title,
        slug,
        description,
        destination,
        duration,
        basePrice: basePrice ? Number(basePrice) : null,
        images: Array.isArray(images) ? images : [],
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(experience);
  } catch (error: any) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    );
  }
}
