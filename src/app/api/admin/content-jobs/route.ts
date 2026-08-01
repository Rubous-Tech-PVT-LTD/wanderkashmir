import { NextResponse } from "next/server";
import { ContentJobRepository } from "@/repositories/ContentJobRepository";

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'reddit', 'twitter', 'pinterest', 'email', 'whatsapp'];

export async function POST(request: Request) {
  try {
    const { seoPageId, platforms = PLATFORMS } = await request.json();
    
    if (!seoPageId) {
      return NextResponse.json({ error: "seoPageId is required" }, { status: 400 });
    }

    const jobs = await ContentJobRepository.createJobs(seoPageId, platforms);
    
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seoPageId = searchParams.get("seoPageId");
    
    if (!seoPageId) {
      return NextResponse.json({ error: "seoPageId is required" }, { status: 400 });
    }

    const jobs = await ContentJobRepository.getJobsForPage(seoPageId);
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
