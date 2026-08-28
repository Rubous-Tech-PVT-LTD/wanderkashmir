import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const maxDuration = 60; // GSC Analytics can take some time

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
