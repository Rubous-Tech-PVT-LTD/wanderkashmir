import { NextResponse } from "next/server";
import { validateSeoContent } from "@/lib/seo/validation-engine";
import { getAdminSession } from "@/lib/auth";

export const maxDuration = 60; 

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { strategy, generatedContent } = await request.json();
    if (!strategy || !generatedContent) {
      return NextResponse.json({ success: false, error: "Strategy and generated content are required" }, { status: 400 });
    }

    const validationReport = await validateSeoContent(strategy, generatedContent);
    return NextResponse.json({ success: true, data: validationReport });
  } catch (error: any) {
    console.error("Validation API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
