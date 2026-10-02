import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export type RateLimitType = "CUSTOMIZE_TRIP" | "PROPERTY_ENQUIRY";

export interface RateLimitCheckResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
  error?: string;
  isRateLimited?: boolean;
}

// 1. Centralized rate limit configuration
export const RATE_LIMIT_CONFIG = {
  CUSTOMIZE_TRIP: {
    limit: 5,
    window: "10 m" as const,
    prefix: "v2:rate-limit:customize-trip",
  },
  PROPERTY_ENQUIRY: {
    limit: 5,
    window: "10 m" as const,
    prefix: "v2:rate-limit:property-enquiry",
  },
};

// 2. Redis Client Singleton
let redisClient: Redis | null = null;
let customizeTripLimiter: Ratelimit | null = null;
let propertyEnquiryLimiter: Ratelimit | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  redisClient = new Redis({
    url,
    token,
  });

  return redisClient;
}

function getLimiter(type: RateLimitType): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  if (type === "CUSTOMIZE_TRIP") {
    if (!customizeTripLimiter) {
      customizeTripLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.CUSTOMIZE_TRIP.limit,
          RATE_LIMIT_CONFIG.CUSTOMIZE_TRIP.window
        ),
        prefix: RATE_LIMIT_CONFIG.CUSTOMIZE_TRIP.prefix,
        analytics: false,
      });
    }
    return customizeTripLimiter;
  }

  if (type === "PROPERTY_ENQUIRY") {
    if (!propertyEnquiryLimiter) {
      propertyEnquiryLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.PROPERTY_ENQUIRY.limit,
          RATE_LIMIT_CONFIG.PROPERTY_ENQUIRY.window
        ),
        prefix: RATE_LIMIT_CONFIG.PROPERTY_ENQUIRY.prefix,
        analytics: false,
      });
    }
    return propertyEnquiryLimiter;
  }

  return null;
}

/**
 * Validates whether a string has a valid IPv4 or IPv6 format.
 * Prevents header injection or spoofing via malformed header values.
 */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== "string" || ip.length > 45) return false;
  const trimmed = ip.trim();
  const ipv4Regex = /^(?:(?:\d{1,3}\.){3}\d{1,3})$/;
  const ipv6Regex = /^[a-fA-F0-9:]+$/;
  return ipv4Regex.test(trimmed) || ipv6Regex.test(trimmed);
}

/**
 * Extracts and sanitizes the client IP from request headers using trusted proxy conventions.
 * Prioritizes direct proxy headers (x-real-ip, cf-connecting-ip) and parses x-forwarded-for safely.
 */
export function extractClientIp(headersList: { get: (name: string) => string | null }): string {
  // 1. Direct trusted reverse proxy headers
  const cfConnectingIp = headersList.get("cf-connecting-ip");
  if (cfConnectingIp && isValidIp(cfConnectingIp)) {
    return cfConnectingIp.trim();
  }

  const xRealIp = headersList.get("x-real-ip");
  if (xRealIp && isValidIp(xRealIp)) {
    return xRealIp.trim();
  }

  // 2. Standard x-forwarded-for header (first hop is the original client IP)
  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstHop = xForwardedFor.split(",")[0]?.trim();
    if (firstHop && isValidIp(firstHop)) {
      return firstHop;
    }
  }

  // 3. Fallback for local development or direct environments
  return "127.0.0.1";
}

/**
 * Checks distributed rate limit for a specific public action and IP.
 * Executes BEFORE any database write operations.
 * Fails closed safely if the distributed provider is unavailable.
 */
export async function checkRateLimit(
  type: RateLimitType,
  ip: string
): Promise<RateLimitCheckResult> {
  const limiter = getLimiter(type);

  // If Redis credentials are not configured, fail-closed for abuse prevention
  if (!limiter) {
    console.error(`[RateLimit] Missing Upstash Redis credentials for ${type}`);
    return {
      success: false,
      error: "Service temporarily unavailable. Please try again in a few moments or message us directly on WhatsApp.",
      isRateLimited: false,
    };
  }

  try {
    const cleanIp = isValidIp(ip) ? ip.trim() : "127.0.0.1";
    const result = await limiter.limit(cleanIp);

    if (!result.success) {
      return {
        success: false,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        error: "Too many requests. Please try again in a few minutes.",
        isRateLimited: true,
      };
    }

    return {
      success: true,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (err: any) {
    console.error(`[RateLimit] Provider error during ${type} check:`, err?.message || err);
    // Fail-closed with controlled message, never exposing Redis internals or stack traces
    return {
      success: false,
      error: "Service temporarily unavailable. Please try again in a few moments or message us directly on WhatsApp.",
      isRateLimited: false,
    };
  }
}
