import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { slug, type, title, description, h1Heading, content, faqs, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    // Optional: add authorization check here to ensure user is ADMIN

    // Check if updating to a slug that already exists for a DIFFERENT page
    if (slug) {
      const existing = await prisma.seoLandingPage.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
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
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Error updating SEO page:", error);
    return NextResponse.json({ error: "Failed to update SEO page" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    // Optional: add authorization check here to ensure user is ADMIN

    await prisma.seoLandingPage.delete({
      where: { id },
    });

    return NextResponse.json({ message: "SEO Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting SEO page:", error);
    return NextResponse.json({ error: "Failed to delete SEO page" }, { status: 500 });
  }
}
