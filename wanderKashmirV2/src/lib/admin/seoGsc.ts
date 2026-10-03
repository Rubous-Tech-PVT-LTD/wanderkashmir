import crypto from "crypto";
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import prisma from "@/lib/prisma";

export interface GscDailyMetric {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscQueryMetric {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscPageMetric {
  pageUrl: string;
  cleanPath: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscConnectionStatus {
  connected: boolean;
  status: "CONNECTED" | "NOT_CONFIGURED" | "AUTH_ERROR" | "PERMISSION_ERROR" | "API_ERROR";
  siteUrl: string;
  permissionLevel: string;
  authenticatedEmail?: string;
  message: string;
  lastChecked: string;
}

export interface Gsc90DayOverviewResult {
  success: boolean;
  connected: boolean;
  status: "CONNECTED" | "NOT_CONFIGURED" | "AUTH_ERROR" | "PERMISSION_ERROR" | "API_ERROR";
  siteUrl: string;
  permissionLevel: string;
  authenticatedEmail?: string;
  message: string;
  startDate: string;
  endDate: string;
  lastUpdated: string;
  totals: {
    clicks: number;
    impressions: number;
    averageCtr: number;
    averagePosition: number;
  };
  daily: GscDailyMetric[];
  topQueries: GscQueryMetric[];
  topPages: GscPageMetric[];
}

// In-memory cache for live GSC responses to prevent unnecessary API hammering
interface CacheEntry {
  data: Gsc90DayOverviewResult;
  timestamp: number;
}
let overviewCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Safe environment variable reader that checks process.env first,
 * with fallback to the root .env file if running in subproject context.
 */
function getEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];

  try {
    const rootEnvPath = path.resolve(process.cwd(), "../.env");
    if (fs.existsSync(rootEnvPath)) {
      const content = fs.readFileSync(rootEnvPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [k, ...rest] = trimmed.split("=");
          if (k.trim() === key) {
            return rest.join("=").trim().replace(/^["']|["']$/g, "");
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Decrypts AES-256-GCM tokens using the system ENCRYPTION_KEY.
 */
function decryptToken(encryptedText: string): string {
  const encryptionKey = getEnv("ENCRYPTION_KEY");
  if (!encryptionKey) {
    throw new Error("ENCRYPTION_KEY not configured.");
  }

  const keyBuffer =
    Buffer.from(encryptionKey, "hex").length === 32
      ? Buffer.from(encryptionKey, "hex")
      : crypto.scryptSync(encryptionKey, "salt", 32);

  const [ivHex, encryptedHex, authTagHex] = encryptedText.split(":");
  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error("Malformed encrypted token string.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    keyBuffer,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Creates an authenticated OAuth2 client using the existing token stored in SystemConfig.
 */
async function getGscAuthClient() {
  const clientId = getEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri =
    process.env.NODE_ENV === "production"
      ? "https://www.wanderkashmir.com/api/auth/google/callback"
      : getEnv("GOOGLE_REDIRECT_URI") || "http://localhost:3000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth client credentials (GOOGLE_CLIENT_ID/SECRET).");
  }

  const tokenRecord = await prisma.systemConfig.findUnique({
    where: { key: "GSC_REFRESH_TOKEN" },
  });

  if (!tokenRecord || !tokenRecord.value) {
    throw new Error("Google Search Console refresh token is not present in SystemConfig.");
  }

  const refreshToken = decryptToken(tokenRecord.value);

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

/**
 * Retrieves the configured GSC Site URL from SystemConfig or defaults to sc-domain:wanderkashmir.com.
 */
async function getGscPropertyUrl(): Promise<string> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "GSC_SITE_URL" },
    });
    return config?.value || "sc-domain:wanderkashmir.com";
  } catch {
    return "sc-domain:wanderkashmir.com";
  }
}

/**
 * Checks connection diagnostics and returns structured status.
 */
export async function getGscConnectionStatus(): Promise<GscConnectionStatus> {
  const siteUrl = await getGscPropertyUrl();
  const lastChecked = new Date().toISOString();

  try {
    const clientId = getEnv("GOOGLE_CLIENT_ID");
    const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return {
        connected: false,
        status: "NOT_CONFIGURED",
        siteUrl,
        permissionLevel: "none",
        message: "Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not configured.",
        lastChecked,
      };
    }

    const tokenRecord = await prisma.systemConfig.findUnique({
      where: { key: "GSC_REFRESH_TOKEN" },
    });

    if (!tokenRecord || !tokenRecord.value) {
      return {
        connected: false,
        status: "NOT_CONFIGURED",
        siteUrl,
        permissionLevel: "none",
        message: "Google Search Console is not connected. No refresh token found.",
        lastChecked,
      };
    }

    const auth = await getGscAuthClient();
    const searchconsole = google.searchconsole({ version: "v1", auth });

    // Verify property access level
    const sitesRes = await searchconsole.sites.list();
    const siteEntries = sitesRes.data.siteEntry || [];
    const matched = siteEntries.find((s) => s.siteUrl === siteUrl);

    // Retrieve stored email if any
    const emailRecord = await prisma.systemConfig.findUnique({
      where: { key: "GSC_ACCOUNT_EMAIL" },
    });

    let maskedEmail: string | undefined;
    if (emailRecord?.value && emailRecord.value.includes("@")) {
      const [user, host] = emailRecord.value.split("@");
      const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
      maskedEmail = `${maskedUser}@${host}`;
    }

    const perm = matched?.permissionLevel || "siteOwner";

    return {
      connected: true,
      status: "CONNECTED",
      siteUrl,
      permissionLevel: perm,
      authenticatedEmail: maskedEmail,
      message: `Connected to Google Search Console (${siteUrl}). Access level: ${perm}.`,
      lastChecked,
    };
  } catch (error: any) {
    const errorMsg = error?.message || "Unknown error";
    const isAuth = errorMsg.includes("invalid_grant") || errorMsg.includes("401");
    const isPerm = errorMsg.includes("403") || errorMsg.includes("permission");

    return {
      connected: false,
      status: isAuth ? "AUTH_ERROR" : isPerm ? "PERMISSION_ERROR" : "API_ERROR",
      siteUrl,
      permissionLevel: "none",
      message: `GSC Connection Diagnostic Error: ${errorMsg}`,
      lastChecked,
    };
  }
}

/**
 * Calculates a dynamic 90-day date range that accounts for Google Search Console's 2-day reporting lag.
 */
export function getGsc90DayDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  // GSC data is typically available up to 2-3 days prior
  const endDateObj = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const startDateObj = new Date(endDateObj.getTime() - 90 * 24 * 60 * 60 * 1000);

  return {
    startDate: startDateObj.toISOString().split("T")[0],
    endDate: endDateObj.toISOString().split("T")[0],
  };
}

/**
 * Fetches the complete 90-day Search Console overview including totals,
 * daily performance trend, top queries, and top pages.
 */
export async function getGsc90DayOverview(
  forceRefresh = false
): Promise<Gsc90DayOverviewResult> {
  const now = Date.now();
  if (!forceRefresh && overviewCache && now - overviewCache.timestamp < CACHE_TTL_MS) {
    return overviewCache.data;
  }

  const { startDate, endDate } = getGsc90DayDateRange();
  const siteUrl = await getGscPropertyUrl();
  const lastUpdated = new Date().toISOString();

  try {
    const auth = await getGscAuthClient();
    const searchconsole = google.searchconsole({ version: "v1", auth });

    // Execute 3 live queries in parallel: daily trend, top queries, top pages
    const [dailyRes, queriesRes, pagesRes] = await Promise.all([
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["date"],
          rowLimit: 100,
        },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 20,
        },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 20,
        },
      }),
    ]);

    // Parse daily data sorted chronologically
    const rawDailyRows = dailyRes.data.rows || [];
    const daily: GscDailyMetric[] = rawDailyRows
      .map((r) => ({
        date: r.keys?.[0] || "",
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: r.ctr || 0,
        position: r.position ? Number(r.position.toFixed(1)) : 0,
      }))
      .filter((d) => d.date.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals across daily metrics
    let totalClicks = 0;
    let totalImpressions = 0;
    let weightedPositionSum = 0;

    for (const d of daily) {
      totalClicks += d.clicks;
      totalImpressions += d.impressions;
      weightedPositionSum += d.position * d.impressions;
    }

    const averageCtr =
      totalImpressions > 0
        ? Number(((totalClicks / totalImpressions) * 100).toFixed(2))
        : 0;

    const averagePosition =
      totalImpressions > 0
        ? Number((weightedPositionSum / totalImpressions).toFixed(1))
        : daily.length > 0
        ? Number((daily.reduce((acc, d) => acc + d.position, 0) / daily.length).toFixed(1))
        : 0;

    // Parse top queries
    const rawQueryRows = queriesRes.data.rows || [];
    const topQueries: GscQueryMetric[] = rawQueryRows.map((r) => ({
      query: r.keys?.[0] || "Unknown",
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr ? Number((r.ctr * 100).toFixed(2)) : 0,
      position: r.position ? Number(r.position.toFixed(1)) : 0,
    }));

    // Parse top pages with clean path extraction
    const rawPageRows = pagesRes.data.rows || [];
    const topPages: GscPageMetric[] = rawPageRows.map((r) => {
      const pageUrl = r.keys?.[0] || "";
      let cleanPath = pageUrl;
      try {
        const parsed = new URL(pageUrl);
        cleanPath = parsed.pathname || "/";
      } catch {
        // use original string
      }
      return {
        pageUrl,
        cleanPath,
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: r.ctr ? Number((r.ctr * 100).toFixed(2)) : 0,
        position: r.position ? Number(r.position.toFixed(1)) : 0,
      };
    });

    const result: Gsc90DayOverviewResult = {
      success: true,
      connected: true,
      status: "CONNECTED",
      siteUrl,
      permissionLevel: "siteOwner",
      startDate,
      endDate,
      lastUpdated,
      totals: {
        clicks: totalClicks,
        impressions: totalImpressions,
        averageCtr,
        averagePosition,
      },
      daily,
      topQueries,
      topPages,
      message: `Live data retrieved successfully for ${siteUrl} (${daily.length} days recorded).`,
    };

    overviewCache = { data: result, timestamp: now };
    return result;
  } catch (error: any) {
    const errorMsg = error?.message || "Failed to query Google Search Console API";
    console.error("GSC Overview Query Error:", errorMsg);

    const isConfig = errorMsg.includes("not configured") || errorMsg.includes("not present");
    const isAuth = errorMsg.includes("invalid_grant") || errorMsg.includes("401");
    const isPerm = errorMsg.includes("403") || errorMsg.includes("permission");

    return {
      success: false,
      connected: false,
      status: isConfig ? "NOT_CONFIGURED" : isAuth ? "AUTH_ERROR" : isPerm ? "PERMISSION_ERROR" : "API_ERROR",
      siteUrl,
      permissionLevel: "none",
      startDate,
      endDate,
      lastUpdated,
      totals: {
        clicks: 0,
        impressions: 0,
        averageCtr: 0,
        averagePosition: 0,
      },
      daily: [],
      topQueries: [],
      topPages: [],
      message: errorMsg,
    };
  }
}
