import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      slug, type, title, description, h1Heading, content, faqs, imageUrl,
      workflowState, seoResearch, seoStrategy, validationReport, adminDecision 
    } = body;

    if (!title || !h1Heading) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const action = adminDecision?.action || seoStrategy?.adminDecision;

    // Handle USE_EXISTING_PRIMARY or CONSOLIDATE_EXISTING (Update)
    if (action === "USE_EXISTING_PRIMARY" || action === "CONSOLIDATE_EXISTING" || action === "USE_EXISTING" || action === "CONSOLIDATE") {
      const primaryPageId = adminDecision?.primaryPageId;
      if (!primaryPageId) {
        return NextResponse.json({ error: "primaryPageId is required for this action." }, { status: 400 });
      }

      const existingPage = await prisma.seoLandingPage.findUnique({ where: { id: primaryPageId } });
      if (!existingPage) {
        return NextResponse.json({ error: "Selected primary page not found." }, { status: 400 });
      }

      const updatedPage = await prisma.seoLandingPage.update({
        where: { id: primaryPageId },
        data: {
          title,
          description,
          h1Heading,
          content,
          faqs,
          workflowState,
          seoResearch,
          seoStrategy,
          validationReport,
        },
      });
      return NextResponse.json(updatedPage, { status: 200 });
    } 
    
    // Handle CREATE_NEW_PAGE (Create)
    if (action === "CREATE_NEW_PAGE" || action === "CREATE_NEW" || (!action && !seoStrategy?.recommendedAction?.includes("MANUAL_REVIEW") && !seoResearch?.cannibalizationRisk?.status?.includes("HIGH_RISK"))) {
      if (!slug || !type) {
         return NextResponse.json({ error: "Missing slug or type for new page" }, { status: 400 });
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
          workflowState,
          seoResearch,
          seoStrategy,
          validationReport,
        },
      });

      return NextResponse.json(newPage, { status: 201 });
    }

    // Handle IGNORE or Fallback (Block)
    return NextResponse.json({ error: "Invalid or missing Admin Decision. Generation blocked to prevent duplicates." }, { status: 400 });

  } catch (error) {
    console.error("Error creating/updating SEO page:", error);
    return NextResponse.json({ error: "Failed to process SEO page" }, { status: 500 });
  }
}
