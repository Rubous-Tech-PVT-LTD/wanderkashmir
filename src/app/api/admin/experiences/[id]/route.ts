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

    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        destination: data.destination,
        duration: data.duration,
        basePrice: data.basePrice ? Number(data.basePrice) : null,
        images: Array.isArray(data.images) ? data.images : [],
        status: data.status,
      }
    });

    return NextResponse.json(updatedExperience);
  } catch (error: any) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update experience" },
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

    // Check if the experience is assigned to any tours
    const assignmentCount = await prisma.tourExperience.count({
      where: { experienceId: id }
    });

    if (assignmentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete experience because it is assigned to ${assignmentCount} tour(s). Please remove it from tours first or deactivate it instead.` },
        { status: 400 }
      );
    }

    await prisma.experience.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}
