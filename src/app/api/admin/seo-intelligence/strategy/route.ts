import { NextResponse } from "next/server";
import { generateSeoStrategy } from "@/lib/seo/strategy-engine";
import { getAdminSession } from "@/lib/auth";

export const maxDuration = 120; // Strategy generation with Gemini can take some time

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { research } = await request.json();
    if (!research) {
      return NextResponse.json({ success: false, error: "Research data is required" }, { status: 400 });
    }

    const strategy = await generateSeoStrategy(research);
    return NextResponse.json({ success: true, data: strategy });
  } catch (error: any) {
    console.error("Strategy API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
