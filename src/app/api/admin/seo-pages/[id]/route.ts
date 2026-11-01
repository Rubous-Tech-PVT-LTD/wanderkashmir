import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { slug, type, title, description, h1Heading, content, faqs, imageUrl, workflowState, seoStrategy } = body;

    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    const existing = await prisma.seoLandingPage.findUnique({
      where: { id },
      select: { slug: true, type: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check if updating to a slug that already exists for a DIFFERENT page
    if (slug && slug !== existing.slug) {
      const slugCollision = await prisma.seoLandingPage.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugCollision) {
        return NextResponse.json({ error: "A page with this slug already exists" }, { status: 400 });
      }
    }

    const updatedPage = await prisma.seoLandingPage.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(type && { type }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(h1Heading && { h1Heading }),
        ...(content !== undefined && { content }),
        ...(faqs !== undefined && { faqs }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(workflowState && { workflowState }),
        ...(seoStrategy !== undefined && { seoStrategy }),
      },
    });

    if (updatedPage.type === "DESTINATION" || existing.type === "DESTINATION") {
      revalidatePath("/destinations");
      revalidatePath("/");
      if (updatedPage.slug) {
        revalidatePath(`/destinations/${updatedPage.slug}`);
      }
      if (existing.slug && existing.slug !== updatedPage.slug) {
        revalidatePath(`/destinations/${existing.slug}`);
      }
    }

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Error updating SEO page:", error);
    return NextResponse.json({ error: "Failed to update SEO page" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    const pageToDelete = await prisma.seoLandingPage.findUnique({
      where: { id },
      select: { slug: true, type: true },
    });

    await prisma.seoLandingPage.delete({
      where: { id },
    });

    if (pageToDelete?.type === "DESTINATION") {
      revalidatePath("/destinations");
      revalidatePath("/");
      if (pageToDelete.slug) {
        revalidatePath(`/destinations/${pageToDelete.slug}`);
      }
    }

    return NextResponse.json({ message: "SEO Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting SEO page:", error);
    return NextResponse.json({ error: "Failed to delete SEO page" }, { status: 500 });
  }
}
