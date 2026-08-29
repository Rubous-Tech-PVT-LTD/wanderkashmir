import { NextResponse } from 'next/server';
import { getGscAnalytics, getGscSiteUrl, getGscClient } from '@/lib/gsc-client';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const siteUrl = await getGscSiteUrl();
    
    // Test if GSC is connected at all
    try {
      await getGscClient();
    } catch (e: any) {
      if (e.message.includes('GSC_REFRESH_TOKEN not found') || e.message.includes('Missing Google OAuth credentials')) {
        return NextResponse.json({ success: false, error: 'GSC not connected' }, { status: 400 });
      }
      throw e;
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Passing empty dimensions array to get sitewide totals
    const rows = await getGscAnalytics(siteUrl, startDate, endDate, []);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: {
          hasData: false,
          message: "No GSC data available for this period"
        }
      });
    }

    const totals = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        hasData: true,
        siteUrl,
        startDate,
        endDate,
        metrics: {
          clicks: totals.clicks || 0,
          impressions: totals.impressions || 0,
          ctr: totals.ctr || 0,
          position: totals.position || 0,
        }
      }
    });
  } catch (error: any) {
    console.error("GSC Overview API Error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
