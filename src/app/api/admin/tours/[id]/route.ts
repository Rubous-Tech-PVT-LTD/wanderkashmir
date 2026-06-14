import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const updatedTour = await prisma.tour.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        duration: data.duration,
        destinations: Array.isArray(data.destinations) ? data.destinations : [],
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        category: data.category,
        maxPersons: parseInt(data.maxPersons) || 1,
        images: Array.isArray(data.images) ? data.images : [],
        overview: data.overview,
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        inclusions: Array.isArray(data.inclusions) ? data.inclusions : [],
        exclusions: Array.isArray(data.exclusions) ? data.exclusions : [],
        itinerary: data.itinerary ? data.itinerary : null,
      }
    });

    return NextResponse.json(updatedTour);
  } catch (error: any) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.tour.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tour deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting tour:", error);
    return NextResponse.json(
      { error: "Failed to delete tour" },
      { status: 500 }
    );
  }
}
