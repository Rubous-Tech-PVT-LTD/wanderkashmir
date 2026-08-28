import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getGscProperties, getGscAnalytics, getGscSiteUrl } from "@/lib/gsc-client";

export async function GET() {
  const session = await getAdminSession();
  
  if (!session || session.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let properties: any[] = [];
  try {
    // 1. Fetch properties to verify authentication works
    properties = await getGscProperties();
    
    // 2. Fetch the target site URL from the DB
    const siteUrl = await getGscSiteUrl();
    
    // 3. Fetch sample analytics data for the last 3 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const analytics = await getGscAnalytics(
      siteUrl,
      startDate,
      endDate,
      ['query', 'page']
    );

    return NextResponse.json({
      success: true,
      message: "Google Search Console connected successfully",
      data: {
        configuredSiteUrl: siteUrl,
        availableProperties: properties,
        sampleAnalytics: {
          period: `${startDate} to ${endDate}`,
          rows: analytics.slice(0, 10) // Return top 10 rows for brevity
        }
      }
    });

  } catch (error: any) {
    console.error("Test GSC Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to query analytics for the configured Site URL",
        details: error.message,
        availablePropertiesInAccount: properties // Return this so we can see the correct URL format!
      }, 
      { status: 500 }
    );
  }
}
