import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { detectOpportunities } from "@/lib/seo/opportunity-engine";
import { detectNetNewOpportunities } from "@/lib/seo/net-new-engine";
import { runFeedbackLoop } from "@/lib/seo/feedback-engine";

export const maxDuration = 300; // Full GSC run can take up to 5 minutes

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const opportunities = await prisma.seoOpportunity.findMany({
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
 * Admin-triggered manual discovery — runs site-wide discovery, net-new discovery,
 * and post-publication feedback loop.
 */
export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SEO Discovery] Admin triggered manual discovery");
    const ops = await detectOpportunities(true);
    const netNewOps = await detectNetNewOpportunities(true);
    const feedbackOps = await runFeedbackLoop(true);

    const total = ops.length + netNewOps.length;
    console.log(`[SEO Discovery] Complete — ${total} opportunities discovered, ${feedbackOps.length} feedbacks evaluated`);
    
    return NextResponse.json({
      success: true,
      message: `Discovered and saved ${total} SEO opportunities and evaluated ${feedbackOps.length} feedback loops.`,
      count: total,
      gscCount: ops.length,
      netNewCount: netNewOps.length,
      feedbackCount: feedbackOps.length
    });
  } catch (error: any) {
    console.error("[SEO Discovery] Manual discovery failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
