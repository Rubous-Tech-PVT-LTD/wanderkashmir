import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    
    // Extract fields
    const {
      title,
      slug,
      duration,
      destinations,
      price,
      originalPrice,
      category,
      maxPersons,
      images,
      overview,
    } = body;

    const tour = await prisma.tour.update({
      where: { id },
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
      },
    });

    return NextResponse.json(tour);
  } catch (error: any) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
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
