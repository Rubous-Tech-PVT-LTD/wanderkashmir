import { NextResponse } from "next/server";
import { ContentWorkerService } from "@/services/ContentWorkerService";

export const maxDuration = 60; // For Vercel Free Tier this might still time out at 10s, but we'll try to set it.
// The frontend handles parallelization so this only has to process ONE platform, which takes about 3-5 seconds in Gemini 1.5 Pro.

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const result = await ContentWorkerService.processJob(jobId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
