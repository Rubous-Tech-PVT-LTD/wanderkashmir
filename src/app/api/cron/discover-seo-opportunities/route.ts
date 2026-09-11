import { NextResponse } from "next/server";
import { detectOpportunities } from "@/lib/seo/opportunity-engine";
import { runFeedbackLoop } from "@/lib/seo/feedback-engine";

export const maxDuration = 300; // 5 minutes (max for pro plan on Vercel, allows full GSC run)

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Site-wide discovery (pass true to save to DB)
    const ops = await detectOpportunities(true);

    // 2. Post-publication feedback loop (pass true to save to DB)
    const feedbacks = await runFeedbackLoop(true);

    return NextResponse.json({ 
        success: true, 
        message: `Discovered ${ops.length} query opportunities and evaluated ${feedbacks.length} page feedback loops.`,
        opportunitiesCount: ops.length,
        feedbackCount: feedbacks.length
    });
  } catch (error: any) {
    console.error("Cron SEO Discovery Failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
