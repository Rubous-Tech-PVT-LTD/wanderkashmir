import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { toCanonicalTopic } from "@/lib/seo/opportunity-engine";
import { ManualTrendEvidence } from "@/lib/seo/types";

const VALID_DIRECTIONS = ["RISING", "STABLE", "DECLINING", "UNCLEAR"] as const;
const VALID_STRENGTHS = ["STRONG", "MODERATE", "WEAK", "UNCLEAR"] as const;
const VALID_SEASONALITIES = ["YES", "NO", "UNCLEAR"] as const;

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      opportunityId,
      targetTopic,
      primaryKeyword,
      relatedKeywordsUsed,
      trendDirection,
      trendStrength,
      seasonality,
      peakPeriod,
      lowestPeriod,
      risingQuery,
      risingTopic,
      comparisonObservation,
      notes,
      checkedDate,
    } = body;

    if (!targetTopic || typeof targetTopic !== "string" || !targetTopic.trim()) {
      return NextResponse.json(
        { success: false, error: "Target topic is required." },
        { status: 400 }
      );
    }

    if (!primaryKeyword || typeof primaryKeyword !== "string" || !primaryKeyword.trim()) {
      return NextResponse.json(
        { success: false, error: "Primary keyword is required." },
        { status: 400 }
      );
    }

    if (!VALID_DIRECTIONS.includes(trendDirection)) {
      return NextResponse.json(
        { success: false, error: `Invalid trendDirection. Allowed: ${VALID_DIRECTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_STRENGTHS.includes(trendStrength)) {
      return NextResponse.json(
        { success: false, error: `Invalid trendStrength. Allowed: ${VALID_STRENGTHS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_SEASONALITIES.includes(seasonality)) {
      return NextResponse.json(
        { success: false, error: `Invalid seasonality. Allowed: ${VALID_SEASONALITIES.join(", ")}` },
        { status: 400 }
      );
    }

    const canonicalTopic = toCanonicalTopic(targetTopic);
    const nowIso = new Date().toISOString();
    const sanitizedDate = typeof checkedDate === "string" && checkedDate.trim()
      ? checkedDate.trim()
      : nowIso.split("T")[0];

    const evidence: ManualTrendEvidence = {
      opportunityId: opportunityId || undefined,
      targetTopic: targetTopic.trim(),
      primaryKeyword: primaryKeyword.trim(),
      relatedKeywordsUsed: Array.isArray(relatedKeywordsUsed)
        ? relatedKeywordsUsed.map((k: any) => String(k).trim()).filter(Boolean)
        : [],
      trendDirection,
      trendStrength,
      seasonality,
      peakPeriod: typeof peakPeriod === "string" ? peakPeriod.trim() : undefined,
      lowestPeriod: typeof lowestPeriod === "string" ? lowestPeriod.trim() : undefined,
      risingQuery: typeof risingQuery === "string" ? risingQuery.trim() : undefined,
      risingTopic: typeof risingTopic === "string" ? risingTopic.trim() : undefined,
      comparisonObservation: typeof comparisonObservation === "string" ? comparisonObservation.trim() : undefined,
      notes: typeof notes === "string" ? notes.trim() : undefined,
      checkedDate: sanitizedDate,
      source: "Google Trends — Manual Admin Check",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 1. Safe persistence into SystemConfig
    const configKey = `seo_trend_evidence:${canonicalTopic}`;
    await prisma.systemConfig.upsert({
      where: { key: configKey },
      create: {
        key: configKey,
        value: JSON.stringify(evidence),
      },
      update: {
        value: JSON.stringify(evidence),
      },
    });

    // 2. If opportunity exists, update its googleTrends summary without destructive migrations
    const oppRecord = opportunityId
      ? await prisma.seoOpportunity.findUnique({ where: { id: opportunityId } })
      : await prisma.seoOpportunity.findFirst({
          where: { canonicalTopic, status: { not: "RESOLVED" } },
        });

    if (oppRecord) {
      const currentDecision = (oppRecord.manualReviewDecision && typeof oppRecord.manualReviewDecision === "object")
        ? (oppRecord.manualReviewDecision as Record<string, any>)
        : {};

      await prisma.seoOpportunity.update({
        where: { id: oppRecord.id },
        data: {
          googleTrends: `MANUAL: ${trendDirection} (${trendStrength})`,
          manualReviewDecision: {
            ...currentDecision,
            manualTrendEvidence: evidence,
          },
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Google Trends manual evidence saved successfully.",
      data: evidence,
    });
  } catch (error: any) {
    console.error("Trends Evidence API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save trend evidence" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const opportunityId = searchParams.get("opportunityId");

    if (!topic && !opportunityId) {
      return NextResponse.json(
        { success: false, error: "topic or opportunityId parameter required" },
        { status: 400 }
      );
    }

    let evidence: ManualTrendEvidence | null = null;

    if (topic) {
      const canonicalTopic = toCanonicalTopic(topic);
      const savedConfig = await prisma.systemConfig.findUnique({
        where: { key: `seo_trend_evidence:${canonicalTopic}` },
      });
      if (savedConfig?.value) {
        evidence = JSON.parse(savedConfig.value);
      }
    }

    if (!evidence && opportunityId) {
      const opp = await prisma.seoOpportunity.findUnique({
        where: { id: opportunityId },
      });
      if (opp?.manualReviewDecision && typeof opp.manualReviewDecision === "object") {
        const dec = opp.manualReviewDecision as any;
        if (dec.manualTrendEvidence) {
          evidence = dec.manualTrendEvidence;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: evidence,
    });
  } catch (error: any) {
    console.error("Trends Evidence GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
