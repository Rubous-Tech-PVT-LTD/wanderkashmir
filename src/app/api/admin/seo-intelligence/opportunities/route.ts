import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { detectOpportunities } from "@/lib/seo/opportunity-engine";

export const maxDuration = 300; // Full GSC run can take up to 5 minutes

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const opportunities = await prisma.seoOpportunity.findMany({
      where: {
        status: { not: "RESOLVED" }
      },
      orderBy: {
        opportunityScore: 'desc'
      }
    });
    return NextResponse.json({ success: true, data: opportunities });
  } catch (error: any) {
    console.error("Failed to fetch SEO opportunities", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/seo-intelligence/opportunities
 * Admin-triggered manual discovery — same engine as the daily cron.
 * Runs detectOpportunities(true) which queries GSC, scores clusters,
 * and upserts results into SeoOpportunity table.
 */
export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SEO Discovery] Admin triggered manual discovery");
    const ops = await detectOpportunities(true);

    console.log(`[SEO Discovery] Complete — ${ops.length} opportunities discovered and saved`);
    return NextResponse.json({
      success: true,
      message: `Discovered and saved ${ops.length} SEO opportunities.`,
      count: ops.length
    });
  } catch (error: any) {
    console.error("[SEO Discovery] Manual discovery failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
