import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { decryptString } from "@/lib/encryption";
import { google } from "googleapis";

const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

export async function GET(request: Request) {
  const session = await getAdminSession();
  
  if (!session || session.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") || process.env.GOOGLE_ADS_CUSTOMER_ID;
  const loginCustomerId = searchParams.get("loginCustomerId") || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  const diagnosticInfo = {
    oauthCredentialsLoaded: !!(GOOGLE_ADS_CLIENT_ID && GOOGLE_ADS_CLIENT_SECRET),
    developerTokenConfigured: !!GOOGLE_ADS_DEVELOPER_TOKEN,
    loginCustomerIdConfigured: !!loginCustomerId,
    customerIdConfigured: !!customerId,
    authenticationSuccess: false,
    keywordPlanIdeaServiceSuccess: false,
    keywordIdeasCount: 0,
    exampleKeywords: [] as any[],
    error: null as any
  };

  if (!diagnosticInfo.oauthCredentialsLoaded || !diagnosticInfo.developerTokenConfigured) {
    diagnosticInfo.error = "Missing GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, or GOOGLE_ADS_DEVELOPER_TOKEN";
    return NextResponse.json(diagnosticInfo);
  }

  if (!customerId) {
    diagnosticInfo.error = "Missing customerId (pass ?customerId=XYZ or set GOOGLE_ADS_CUSTOMER_ID)";
    return NextResponse.json(diagnosticInfo);
  }

  try {
    // 1. Get encrypted refresh token
    const config = await prisma.systemConfig.findUnique({
      where: { key: "GOOGLE_ADS_REFRESH_TOKEN" }
    });

    if (!config || !config.value) {
      diagnosticInfo.error = "Google Ads refresh token not found in SystemConfig. User must connect via OAuth first.";
      return NextResponse.json(diagnosticInfo);
    }

    const refreshToken = decryptString(config.value);

    // 2. Generate Access Token
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_ADS_CLIENT_ID,
      GOOGLE_ADS_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      diagnosticInfo.error = "Failed to obtain access token from refresh token.";
      return NextResponse.json(diagnosticInfo);
    }

    diagnosticInfo.authenticationSuccess = true;

    // 3. Call KeywordPlanIdeaService
    // Using v17 as an example, but standard for Ads API
    const formattedCustomerId = customerId.replace(/-/g, '');
    const apiUrl = `https://googleads.googleapis.com/v17/customers/${formattedCustomerId}:generateKeywordIdeas`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN as string,
      'Content-Type': 'application/json'
    };

    if (loginCustomerId) {
      headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
    }

    const body = {
      keywordSeed: {
        keywords: ['kashmir tour package']
      },
      pageSize: 5 // Minimal results
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      // Redact sensitive values from error if any, though usually Google doesn't return them in response
      diagnosticInfo.error = {
        status: response.status,
        statusText: response.statusText,
        details: data.error
      };
      return NextResponse.json(diagnosticInfo);
    }

    diagnosticInfo.keywordPlanIdeaServiceSuccess = true;
    
    if (data.results && Array.isArray(data.results)) {
      diagnosticInfo.keywordIdeasCount = data.results.length;
      diagnosticInfo.exampleKeywords = data.results.map((r: any) => {
        return {
          text: r.keywordIdeaMetrics?.text || r.text, // Depends on exact response structure, usually r.text
          avgMonthlySearches: r.keywordIdeaMetrics?.avgMonthlySearches
        };
      });
    }

    return NextResponse.json(diagnosticInfo);

  } catch (err: any) {
    diagnosticInfo.error = err.message || "Unknown error occurred";
    return NextResponse.json(diagnosticInfo);
  }
}
