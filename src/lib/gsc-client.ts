import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { decryptString } from "@/lib/encryption";

const gscCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3600 * 1000; // 1 hour

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.NODE_ENV === "production" 
  ? "https://www.wanderkashmir.com/api/auth/google/callback" 
  : process.env.GOOGLE_REDIRECT_URI;

/**
 * Initializes and returns an authenticated OAuth2 client for Google APIs.
 */
export async function getGscClient() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth credentials in environment");
  }

  const configRecord = await prisma.systemConfig.findUnique({
    where: { key: "GSC_REFRESH_TOKEN" }
  });

  if (!configRecord || !configRecord.value) {
    throw new Error("GSC_REFRESH_TOKEN not found in database. Admin must connect Google Search Console first.");
  }

  const refreshToken = decryptString(configRecord.value);

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  // The google-auth-library will automatically handle token refresh when we pass a refresh_token
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return oauth2Client;
}

/**
 * Gets the configured GSC Site URL from the database.
 * If not set, falls back to https://www.wanderkashmir.com/ and saves it.
 */
export async function getGscSiteUrl(): Promise<string> {
  let configRecord = await prisma.systemConfig.findUnique({
    where: { key: "GSC_SITE_URL" }
  });

  if (!configRecord) {
    // Default fallback as requested
    const defaultUrl = "sc-domain:wanderkashmir.com";
    configRecord = await prisma.systemConfig.create({
      data: { key: "GSC_SITE_URL", value: defaultUrl }
    });
  }

  return configRecord.value;
}

/**
 * Fetches all verified Search Console properties for the authenticated account.
 */
export async function getGscProperties() {
  const auth = await getGscClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const response = await searchconsole.sites.list();
  return response.data.siteEntry || [];
}

export async function getGscAnalytics(
  siteUrl: string, 
  startDate: string, 
  endDate: string, 
  dimensions: string[] = ['page', 'query', 'country', 'device']
) {
  const cacheKey = `analytics:${siteUrl}:${startDate}:${endDate}:${dimensions.join(',')}`;
  const cached = gscCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const auth = await getGscClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
      }
    });

    const data = response.data.rows || [];
    gscCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error: any) {
    console.error("GSC API Error:", error.message);
    if (cached) return cached.data; // Stale fallback
    return []; // Graceful fallback
  }
}
