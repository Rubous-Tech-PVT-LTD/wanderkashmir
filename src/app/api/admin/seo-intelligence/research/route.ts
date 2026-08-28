import { NextResponse } from "next/server";
import { runSeoResearch } from "@/lib/seo/research-engine";
import { getAdminSession } from "@/lib/auth";

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { target, type, url, historicalBaseline } = await request.json();
    if (!target || !type) {
      return NextResponse.json({ success: false, error: "Target and type are required" }, { status: 400 });
    }

    const research = await runSeoResearch(target, type, url, historicalBaseline);
    return NextResponse.json({ success: true, data: research });
  } catch (error: any) {
    console.error("Research API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
