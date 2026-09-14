import { NextResponse } from 'next/server';
import { getGscAnalytics, getGscSiteUrl, getGscClient } from '@/lib/gsc-client';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: Request) {
  let siteUrl = "sc-domain:wanderkashmir.com";
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    siteUrl = await getGscSiteUrl();
    
    // Test if GSC is connected at all
    try {
      await getGscClient();
    } catch (e: any) {
      if (e.message?.includes('GSC_REFRESH_TOKEN not found') || e.message?.includes('Missing Google OAuth credentials') || e.code === 'TOKEN_MISSING') {
        return NextResponse.json({ success: false, status: 'NOT_CONNECTED', error: 'GSC not connected' }, { status: 400 });
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
          status: 'SUCCESS_NO_DATA',
          siteUrl,
          startDate,
          endDate,
          message: "Google Search Console is connected, but returned no metrics for the last 30 days."
        }
      });
    }

    const totals = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        hasData: true,
        status: 'SUCCESS_WITH_DATA',
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

    const isPermissionError = error.code === 'PERMISSION_ERROR' || error.status === 403 || error.message?.toLowerCase().includes('permission');
    const isAuthError = error.code === 'AUTH_ERROR' || error.status === 401 || error.message?.toLowerCase().includes('invalid_grant');

    if (isPermissionError) {
      return NextResponse.json({
        success: false,
        status: 'PERMISSION_ERROR',
        siteUrl,
        error: `Google Search Console permission error: The connected Google account does not currently have sufficient access to '${siteUrl}'. (Permission level: siteUnverifiedUser).`,
        requiresReauth: true
      }, { status: 403 });
    }

    if (isAuthError) {
      return NextResponse.json({
        success: false,
        status: 'AUTH_ERROR',
        siteUrl,
        error: "Google Search Console authentication expired or revoked. Please reconnect your account.",
        requiresReauth: true
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      status: 'API_ERROR',
      siteUrl,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
