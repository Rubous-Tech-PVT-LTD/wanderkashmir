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
    // Using v25 as specified
    const formattedCustomerId = customerId.replace(/-/g, '');
    const apiUrl = `https://googleads.googleapis.com/v25/customers/${formattedCustomerId}:generateKeywordIdeas`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN as string,
      'Content-Type': 'application/json'
    };

    if (loginCustomerId) {
      headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
    }

    const body = {
      // The API requires the customerId in the payload or URL depending on version. We'll pass it in URL.
      // 1000 is English
      language: "languageConstants/1000",
      // 2356 is India
      geoTargetConstants: ["geoTargetConstants/2356"],
      keywordPlanNetwork: "GOOGLE_SEARCH",
      keywordSeed: {
        keywords: ['kashmir tour package']
      },
      pageSize: 5
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const contentType = response.headers.get("content-type") || "";
    const bodyText = await response.text();

    diagnosticInfo.error = null; // Clear initial errors

    if (!response.ok) {
      diagnosticInfo.error = {
        status: response.status,
        contentType: contentType,
        url: apiUrl,
        bodyPreview: bodyText.slice(0, 500)
      };
      return NextResponse.json(diagnosticInfo);
    }

    const data = contentType.includes("application/json")
      ? JSON.parse(bodyText)
      : { rawResponse: bodyText.slice(0, 500) };

    diagnosticInfo.keywordPlanIdeaServiceSuccess = true;
    
    if (data.results && Array.isArray(data.results)) {
      diagnosticInfo.keywordIdeasCount = data.results.length;
      diagnosticInfo.exampleKeywords = data.results.map((r: any) => {
        return {
          text: r.keywordIdeaMetrics?.text || r.text, 
          avgMonthlySearches: r.keywordIdeaMetrics?.avgMonthlySearches
        };
      });
    } else {
       diagnosticInfo.exampleKeywords = data.rawResponse ? [data.rawResponse] : [];
    }

    return NextResponse.json(diagnosticInfo);

  } catch (err: any) {
    diagnosticInfo.error = err.message || "Unknown error occurred";
    return NextResponse.json(diagnosticInfo);
  }
}
