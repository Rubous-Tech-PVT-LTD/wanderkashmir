import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { toCanonicalTopic } from "@/lib/seo/opportunity-engine";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetTopic, decision, opportunityId } = await request.json();

    if (!targetTopic || !decision || !decision.type) {
      return NextResponse.json({ success: false, error: "targetTopic and valid decision are required." }, { status: 400 });
    }

    const canonicalTopic = toCanonicalTopic(targetTopic);

    // Save decision audit trail in SeoOpportunity if it exists
    const record = opportunityId 
      ? await prisma.seoOpportunity.findUnique({ where: { id: opportunityId } })
      : await prisma.seoOpportunity.findFirst({
          where: { canonicalTopic, status: { not: "RESOLVED" } }
        });

    if (record) {
      await prisma.seoOpportunity.update({
        where: { id: record.id },
        data: {
          manualReviewDecision: {
            ...decision,
            decidedBy: session.email || "ADMIN",
            decidedAt: new Date().toISOString()
          },
          status: decision.type === "IGNORE" ? "RESOLVED" : "RESEARCHED",
          reason: decision.type === "IGNORE" ? "Ignored by Admin during Manual Review." : record.reason,
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Manual Review decision "${decision.type}" recorded successfully.`,
      decision: {
        ...decision,
        decidedBy: session.email || "ADMIN",
        decidedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Manual Review Decision API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
