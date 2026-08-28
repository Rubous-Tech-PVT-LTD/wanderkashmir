import { NextResponse } from "next/server";
import { generateSeoContent } from "@/lib/seo/generation-engine";
import { getAdminSession } from "@/lib/auth";

export const maxDuration = 300; // Text generation takes the longest

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { research, strategy, existingContent } = await request.json();
    if (!research || !strategy) {
      return NextResponse.json({ success: false, error: "Research and strategy data are required" }, { status: 400 });
    }

    if (
      (research?.cannibalizationRisk?.status === 'HIGH_RISK' ||
       strategy?.recommendedAction === 'MANUAL_REVIEW' ||
       strategy?.manualReviewRequired) &&
      !strategy?.adminDecision
    ) {
      return NextResponse.json({
        success: false,
        error: "Generation blocked: Manual Review is required due to high cannibalization risk. Select an explicit Admin Decision before generating content."
      }, { status: 400 });
    }

    const content = await generateSeoContent(research, strategy, existingContent);
    return NextResponse.json({ success: true, data: content });
  } catch (error: any) {
    console.error("Generation API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
