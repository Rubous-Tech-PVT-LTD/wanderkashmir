import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tours = await prisma.tour.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000
    });

    return NextResponse.json(tours);
  } catch (error: any) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
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
      duration,
      destinations,
      price,
      category,
      maxPersons,
      images,
      overview,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      originalPrice,
    } = body;

    const tour = await prisma.tour.create({
      data: {
        title,
        slug,
        duration,
        destinations: Array.isArray(destinations) ? destinations : [],
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        maxPersons: parseInt(maxPersons),
        images: Array.isArray(images) ? images : [],
        overview,
        highlights: Array.isArray(highlights) ? highlights : [],
        inclusions: Array.isArray(inclusions) ? inclusions : [],
        exclusions: Array.isArray(exclusions) ? exclusions : [],
        itinerary: itinerary ? itinerary : null,
      },
    });

    return NextResponse.json(tour);
  } catch (error: any) {
    console.error("Error creating tour:", error);
    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    );
  }
}
