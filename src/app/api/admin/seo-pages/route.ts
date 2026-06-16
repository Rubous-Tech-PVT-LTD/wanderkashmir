import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // e.g., TAXI, HOMESTAY, TOUR

    const whereClause = type && type !== "ALL" ? { type } : {};
    
    const pages = await prisma.seoLandingPage.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching SEO pages:", error);
    return NextResponse.json({ error: "Failed to fetch SEO pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, type, title, description, h1Heading, content, faqs, imageUrl } = body;

    // Optional: add authorization check here to ensure user is ADMIN

    if (!slug || !type || !title || !h1Heading) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.seoLandingPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A page with this slug already exists" }, { status: 400 });
    }

    const newPage = await prisma.seoLandingPage.create({
      data: {
        slug,
        type,
        title,
        description,
        h1Heading,
        content,
        faqs,
        imageUrl,
      },
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error("Error creating SEO page:", error);
    return NextResponse.json({ error: "Failed to create SEO page" }, { status: 500 });
  }
}
