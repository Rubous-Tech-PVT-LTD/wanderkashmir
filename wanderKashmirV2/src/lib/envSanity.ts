/**
 * Environment sanity checker for WanderKashmir V2.
 * Validates presence of essential environment variables without exposing secret values.
 */

export interface EnvSanityResult {
  passed: boolean;
  databaseConfigured: boolean;
  jwtConfigured: boolean;
  siteUrlConfigured: boolean;
  upstashConfigured: boolean;
  googlePlacesConfigured: boolean;
  gscConfigured: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvSanityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Mandatory Database Configuration
  const databaseUrl = process.env.DATABASE_URL;
  const databaseConfigured = Boolean(databaseUrl && databaseUrl.trim().length > 0);
  if (!databaseConfigured) {
    errors.push("DATABASE_URL is missing or empty.");
  } else if (!databaseUrl!.startsWith("postgres://") && !databaseUrl!.startsWith("postgresql://")) {
    warnings.push("DATABASE_URL does not use standard postgresql:// prefix.");
  }

  // 2. Mandatory JWT Secret for Admin Authentication
  const jwtSecret = process.env.JWT_SECRET;
  const jwtConfigured = Boolean(jwtSecret && jwtSecret.trim().length >= 16);
  if (!jwtConfigured) {
    errors.push("JWT_SECRET is missing or shorter than 16 characters.");
  }

  // 3. Site URL Configuration
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const siteUrlConfigured = Boolean(siteUrl && siteUrl.startsWith("http"));
  if (process.env.NODE_ENV === "production") {
    if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
      warnings.push("NEXT_PUBLIC_SITE_URL is pointing to a local address in production mode.");
    }
  }

  // 4. Distributed Rate Limiting (Upstash Redis)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const upstashConfigured = Boolean(upstashUrl && upstashToken);
  if (!upstashConfigured) {
    warnings.push("Upstash Redis credentials are not configured; fallback in-memory rate limiting is active.");
  }

  // 5. Google Places API (for live reviews)
  const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const googlePlacesConfigured = Boolean(googlePlacesApiKey && googlePlacesApiKey.trim().length > 0);
  if (!googlePlacesConfigured) {
    warnings.push("GOOGLE_PLACES_API_KEY is not configured; verified curated reviews fallback will be used.");
  }

  // 6. Google Search Console
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const gscConfigured = Boolean(googleClientId && googleClientSecret);
  if (!gscConfigured) {
    warnings.push("Google OAuth credentials for GSC integration are not configured.");
  }

  const passed = errors.length === 0;

  return {
    passed,
    databaseConfigured,
    jwtConfigured,
    siteUrlConfigured,
    upstashConfigured,
    googlePlacesConfigured,
    gscConfigured,
    errors,
    warnings,
  };
}
