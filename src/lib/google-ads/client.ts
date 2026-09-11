import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { decryptString } from "@/lib/encryption";
import { Redis } from "@upstash/redis";

const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID || "9633496997";
const GOOGLE_ADS_LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "6548000449";

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface KeywordIdea {
  text: string;
  searchVolume: number | null;
  competition: string;
  competitionIndex: number | null;
}

export async function fetchKeywordIdeas(seedKeywords: string[]): Promise<KeywordIdea[]> {
  if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_DEVELOPER_TOKEN) {
    throw new Error("Missing Google Ads credentials in environment variables.");
  }
  
  // Normalize and deduplicate seeds
  const uniqueSeeds = Array.from(new Set(seedKeywords.map(s => s.toLowerCase().trim()))).filter(Boolean);
  if (uniqueSeeds.length === 0) return [];
  
  // Try caching if redis is available
  const cacheKey = `gads:keywords:${uniqueSeeds.sort().join(",")}`;
  if (redis) {
    try {
      const cachedData = await redis.get<KeywordIdea[]>(cacheKey);
      if (cachedData && Array.isArray(cachedData)) {
        console.log(`[Google Ads] Cache hit for ${uniqueSeeds.length} seeds`);
        return cachedData;
      }
    } catch (err) {
      console.warn("Redis cache read failed:", err);
    }
  }

  // 1. Get encrypted refresh token
  const config = await prisma.systemConfig.findUnique({
    where: { key: "GOOGLE_ADS_REFRESH_TOKEN" }
  });

  if (!config || !config.value) {
    throw new Error("Google Ads refresh token not found in SystemConfig. User must connect via OAuth first.");
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
    throw new Error("Failed to obtain access token from refresh token.");
  }

  // 3. Call KeywordPlanIdeaService
  const formattedCustomerId = GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, '');
  const apiUrl = `https://googleads.googleapis.com/v25/customers/${formattedCustomerId}:generateKeywordIdeas`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN as string,
    'Content-Type': 'application/json'
  };

  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    headers['login-customer-id'] = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, '');
  }

  const body = {
    language: "languageConstants/1000", // English
    geoTargetConstants: ["geoTargetConstants/2356"], // India
    keywordPlanNetwork: "GOOGLE_SEARCH",
    keywordSeed: {
      keywords: uniqueSeeds
    },
    pageSize: 100 
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Ads API Error:", response.status, errorText);
    throw new Error(`Google Ads API returned status ${response.status}`);
  }

  const data = await response.json();
  const results: KeywordIdea[] = [];
  
  if (data.results && Array.isArray(data.results)) {
    for (const result of data.results) {
      const text = result.keywordIdeaMetrics?.text || result.text;
      const metrics = result.keywordIdeaMetrics;
      if (text) {
        results.push({
          text,
          searchVolume: metrics?.avgMonthlySearches ? parseInt(metrics.avgMonthlySearches, 10) : null,
          competition: metrics?.competition || "UNKNOWN",
          competitionIndex: metrics?.competitionIndex ? parseInt(metrics.competitionIndex, 10) : null
        });
      }
    }
  }

  // Cache results for 24 hours to prevent repeated refresh limits
  if (redis && results.length > 0) {
    try {
      await redis.set(cacheKey, results, { ex: 86400 });
      console.log(`[Google Ads] Cached ${results.length} ideas for seeds`);
    } catch (err) {
      console.warn("Redis cache write failed:", err);
    }
  }

  return results;
}
