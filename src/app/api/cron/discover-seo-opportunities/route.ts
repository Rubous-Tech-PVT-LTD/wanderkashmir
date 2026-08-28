import { NextResponse } from "next/server";
import { detectOpportunities } from "@/lib/seo/opportunity-engine";

export const maxDuration = 300; // 5 minutes (max for pro plan on Vercel, allows full GSC run)

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pass true to save to DB
    const ops = await detectOpportunities(true);

    return NextResponse.json({ 
        success: true, 
        message: `Discovered and persisted ${ops.length} SEO opportunities.` 
    });
  } catch (error: any) {
    console.error("Cron SEO Discovery Failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
