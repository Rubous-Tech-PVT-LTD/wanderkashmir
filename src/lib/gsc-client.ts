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

export class GscApiError extends Error {
  status?: number;
  code?: string;
  reason?: string;
  siteUrl?: string;

  constructor(message: string, options?: { status?: number; code?: string; reason?: string; siteUrl?: string }) {
    super(message);
    this.name = "GscApiError";
    this.status = options?.status;
    this.code = options?.code;
    this.reason = options?.reason;
    this.siteUrl = options?.siteUrl;
  }
}

/**
 * Initializes and returns an authenticated OAuth2 client for Google APIs.
 */
export async function getGscClient() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new GscApiError("Missing Google OAuth credentials in environment", { status: 500, code: "CONFIG_ERROR" });
  }

  const configRecord = await prisma.systemConfig.findUnique({
    where: { key: "GSC_REFRESH_TOKEN" }
  });

  if (!configRecord || !configRecord.value) {
    throw new GscApiError("GSC_REFRESH_TOKEN not found in database. Admin must connect Google Search Console first.", { status: 400, code: "TOKEN_MISSING" });
  }

  let refreshToken: string;
  try {
    refreshToken = decryptString(configRecord.value);
  } catch (err: any) {
    throw new GscApiError("Failed to decrypt GSC_REFRESH_TOKEN", { status: 500, code: "DECRYPTION_ERROR" });
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return oauth2Client;
}

/**
 * Gets the configured GSC Site URL from the database.
 * If not set, falls back to sc-domain:wanderkashmir.com and saves it.
 */
export async function getGscSiteUrl(): Promise<string> {
  let configRecord = await prisma.systemConfig.findUnique({
    where: { key: "GSC_SITE_URL" }
  });

  if (!configRecord) {
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

/**
 * Executes a search analytics query against Google Search Console.
 * NOTE: Does NOT swallow HTTP 403 permission or 401 auth errors.
 */
export async function getGscAnalytics(
  siteUrl: string, 
  startDate: string, 
  endDate: string, 
  dimensions: string[] = ['page', 'query', 'country', 'device'],
  rowLimit: number = 5000
) {
  const cacheKey = `analytics:${siteUrl}:${startDate}:${endDate}:${dimensions.join(',')}:${rowLimit}`;
  const cached = gscCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let auth;
  try {
    auth = await getGscClient();
  } catch (err: any) {
    if (cached) return cached.data;
    throw err;
  }

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit,
      }
    });

    const data = response.data.rows || [];
    gscCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error: any) {
    const status = error.status || error.response?.status;
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error(`GSC API Error [${status || 'UNKNOWN'}]:`, errorDetails);

    // If unauthorized or insufficient permission, DO NOT swallow! Throw GscApiError
    if (status === 403) {
      throw new GscApiError(
        `Insufficient permission for Search Console property '${siteUrl}'. Permission level is insufficient or site is unverified.`,
        { status: 403, code: "PERMISSION_ERROR", siteUrl, reason: errorDetails }
      );
    }

    if (status === 401) {
      throw new GscApiError(
        `Authentication failed for Google Search Console. Refresh token may be revoked or expired.`,
        { status: 401, code: "AUTH_ERROR", siteUrl, reason: errorDetails }
      );
    }

    if (cached) {
      return cached.data; // Stale fallback for transient network errors
    }

    throw new GscApiError(
      `Search Console API request failed: ${errorDetails}`,
      { status: status || 500, code: "API_ERROR", siteUrl, reason: errorDetails }
    );
  }
}

export type GscDiagnosticStatus =
  | 'SUCCESS_WITH_DATA'
  | 'SUCCESS_NO_DATA'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'PROPERTY_ERROR'
  | 'TOKEN_ERROR'
  | 'API_ERROR';

export interface GscDiagnostics {
  overallStatus: GscDiagnosticStatus;
  oauthConfig: {
    clientIdPresent: boolean;
    clientSecretPresent: boolean;
    maskedClientId: string;
    redirectUri: string;
  };
  tokenStatus: {
    tokenPresent: boolean;
    decryptionSuccess: boolean;
    refreshSuccess: boolean;
    errorMessage?: string;
  };
  accountIdentity: {
    authenticatedEmail: string;
    scopes: string[];
  };
  property: {
    configuredUrl: string;
    foundInAccount: boolean;
    permissionLevel: string;
    availableProperties: Array<{ siteUrl: string; permissionLevel: string }>;
  };
  searchAnalytics: {
    tested: boolean;
    httpStatus?: number;
    rowsCount: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    errorMessage?: string;
  };
  userFriendlyMessage: string;
}

/**
 * Runs a comprehensive, non-destructive connection and permission diagnostic test.
 * Safely masks secrets and identifiers.
 */
export async function getGscConnectionDiagnostics(): Promise<GscDiagnostics> {
  const maskedClientId = GOOGLE_CLIENT_ID
    ? `${GOOGLE_CLIENT_ID.slice(0, 8)}...${GOOGLE_CLIENT_ID.slice(-8)}`
    : "NOT_SET";

  const diagnostics: GscDiagnostics = {
    overallStatus: "API_ERROR",
    oauthConfig: {
      clientIdPresent: Boolean(GOOGLE_CLIENT_ID),
      clientSecretPresent: Boolean(GOOGLE_CLIENT_SECRET),
      maskedClientId,
      redirectUri: GOOGLE_REDIRECT_URI || "NOT_SET",
    },
    tokenStatus: {
      tokenPresent: false,
      decryptionSuccess: false,
      refreshSuccess: false,
    },
    accountIdentity: {
      authenticatedEmail: "Unknown",
      scopes: [],
    },
    property: {
      configuredUrl: "sc-domain:wanderkashmir.com",
      foundInAccount: false,
      permissionLevel: "none",
      availableProperties: [],
    },
    searchAnalytics: {
      tested: false,
      rowsCount: 0,
      dateRange: {
        startDate: "",
        endDate: "",
      },
    },
    userFriendlyMessage: "Diagnostic started.",
  };

  // 1. Check Config
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    diagnostics.overallStatus = "AUTH_ERROR";
    diagnostics.userFriendlyMessage = "Google OAuth environment credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are missing.";
    return diagnostics;
  }

  // 2. Fetch Token from SystemConfig
  let tokenRecord;
  let storedEmailRecord;
  try {
    tokenRecord = await prisma.systemConfig.findUnique({
      where: { key: "GSC_REFRESH_TOKEN" }
    });

    storedEmailRecord = await prisma.systemConfig.findUnique({
      where: { key: "GSC_ACCOUNT_EMAIL" }
    });
  } catch (dbErr: any) {
    diagnostics.overallStatus = "API_ERROR";
    diagnostics.userFriendlyMessage = `Database connection error: ${dbErr.message || "Cannot reach database"}`;
    return diagnostics;
  }

  if (storedEmailRecord?.value) {
    diagnostics.accountIdentity.authenticatedEmail = storedEmailRecord.value;
  }

  if (!tokenRecord || !tokenRecord.value) {
    diagnostics.overallStatus = "TOKEN_ERROR";
    diagnostics.userFriendlyMessage = "Google Search Console is not connected. No refresh token stored.";
    return diagnostics;
  }
  diagnostics.tokenStatus.tokenPresent = true;

  // 3. Decrypt Token
  let decryptedToken = "";
  try {
    decryptedToken = decryptString(tokenRecord.value);
    diagnostics.tokenStatus.decryptionSuccess = true;
  } catch (err: any) {
    diagnostics.overallStatus = "TOKEN_ERROR";
    diagnostics.tokenStatus.errorMessage = "Failed to decrypt refresh token with current ENCRYPTION_KEY.";
    diagnostics.userFriendlyMessage = "Stored token decryption failed. Reauthorization is required.";
    return diagnostics;
  }

  // 4. Test OAuth Refresh & Introspection
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: decryptedToken });

  let accessToken = "";
  try {
    const tokenRes = await oauth2Client.getAccessToken();
    accessToken = tokenRes.token || "";
    if (!accessToken) {
      throw new Error("Token refresh returned empty access token");
    }
    diagnostics.tokenStatus.refreshSuccess = true;
  } catch (err: any) {
    diagnostics.overallStatus = "AUTH_ERROR";
    diagnostics.tokenStatus.errorMessage = err.message;
    diagnostics.userFriendlyMessage = "Google OAuth token refresh failed. The token may be revoked or expired. Please reconnect.";
    return diagnostics;
  }

  // Token Introspection
  try {
    const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
    if (tokenInfo.email) {
      diagnostics.accountIdentity.authenticatedEmail = tokenInfo.email;
    }
    diagnostics.accountIdentity.scopes = tokenInfo.scopes || [];
  } catch {
    // Introspection fallback
  }

  // 5. Check Property Permission Level
  const configuredSiteUrl = await getGscSiteUrl();
  diagnostics.property.configuredUrl = configuredSiteUrl;

  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
  let siteEntries: Array<{ siteUrl?: string | null; permissionLevel?: string | null }> = [];
  try {
    const sitesRes = await searchconsole.sites.list();
    siteEntries = sitesRes.data.siteEntry || [];
    diagnostics.property.availableProperties = siteEntries.map(s => ({
      siteUrl: s.siteUrl || "",
      permissionLevel: s.permissionLevel || "none"
    }));

    const matchingEntry = siteEntries.find(s => s.siteUrl === configuredSiteUrl);
    if (matchingEntry) {
      diagnostics.property.foundInAccount = true;
      diagnostics.property.permissionLevel = matchingEntry.permissionLevel || "none";
    }
  } catch (err: any) {
    console.error("Diagnostic sites.list failed:", err.message);
  }

  // Also try direct sites.get for authoritative permission level
  try {
    const siteGetRes = await searchconsole.sites.get({ siteUrl: configuredSiteUrl });
    if (siteGetRes.data.permissionLevel) {
      diagnostics.property.foundInAccount = true;
      diagnostics.property.permissionLevel = siteGetRes.data.permissionLevel;
    }
  } catch (err: any) {
    // If sites.get fails with 403 or 404, capture status
    if (err.status === 403) {
      diagnostics.property.permissionLevel = "siteUnverifiedUser";
    }
  }

  // 6. Test Search Analytics Query
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  diagnostics.searchAnalytics.dateRange = { startDate, endDate };
  diagnostics.searchAnalytics.tested = true;

  try {
    const analyticsRes = await searchconsole.searchanalytics.query({
      siteUrl: configuredSiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 5,
      }
    });

    const rows = analyticsRes.data.rows || [];
    diagnostics.searchAnalytics.httpStatus = 200;
    diagnostics.searchAnalytics.rowsCount = rows.length;

    if (rows.length > 0) {
      diagnostics.overallStatus = "SUCCESS_WITH_DATA";
      diagnostics.userFriendlyMessage = `Successfully connected to Google Search Console! Retrieved ${rows.length} rows for ${configuredSiteUrl}.`;
    } else {
      diagnostics.overallStatus = "SUCCESS_NO_DATA";
      diagnostics.userFriendlyMessage = `Connected to ${configuredSiteUrl}, but no search metrics were recorded for the last 30 days.`;
    }
  } catch (err: any) {
    const status = err.status || err.response?.status || 500;
    const errorMsg = err.response?.data?.error?.message || err.message;
    diagnostics.searchAnalytics.httpStatus = status;
    diagnostics.searchAnalytics.errorMessage = errorMsg;

    if (status === 403 || diagnostics.property.permissionLevel === "siteUnverifiedUser") {
      diagnostics.overallStatus = "PERMISSION_ERROR";
      diagnostics.userFriendlyMessage = `Google Search Console Permission Error: The authenticated Google account (${diagnostics.accountIdentity.authenticatedEmail}) does not have verified owner or full access to '${configuredSiteUrl}' (permission level: ${diagnostics.property.permissionLevel}). Please reconnect using the Google account that has verified access in Search Console.`;
    } else if (status === 401) {
      diagnostics.overallStatus = "AUTH_ERROR";
      diagnostics.userFriendlyMessage = "Authentication failed (401). Please reconnect your Google account.";
    } else {
      diagnostics.overallStatus = "API_ERROR";
      diagnostics.userFriendlyMessage = `Google Search Console API error: ${errorMsg}`;
    }
  }

  return diagnostics;
}
