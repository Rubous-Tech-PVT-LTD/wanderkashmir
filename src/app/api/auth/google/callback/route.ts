import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { encryptString } from "@/lib/encryption";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;

const GOOGLE_REDIRECT_URI = process.env.NODE_ENV === "production" 
  ? "https://www.wanderkashmir.com/api/auth/google/callback" 
  : process.env.GOOGLE_REDIRECT_URI;

export async function GET(request: Request) {
  const session = await getAdminSession();
  
  if (!session || session.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth Error:", error);
    return NextResponse.redirect(new URL("/wander-admin?error=oauth_denied", request.url));
  }

  if (!code || !state) {
    return new NextResponse("Missing code or state", { status: 400 });
  }

  // Validate state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;

  if (!savedState || state !== savedState) {
    return new NextResponse("Invalid state parameter (CSRF)", { status: 403 });
  }

  // Clear state cookie
  cookieStore.delete("google_oauth_state");

  // Determine provider from state prefix
  const isAds = state.startsWith("ADS_");
  const isGsc = state.startsWith("GSC_");

  // Fallback to GSC if neither (for backward compatibility if a flow was in progress)
  const provider = isAds ? "ADS" : "GSC";

  const clientId = provider === "ADS" ? GOOGLE_ADS_CLIENT_ID : GOOGLE_CLIENT_ID;
  const clientSecret = provider === "ADS" ? GOOGLE_ADS_CLIENT_SECRET : GOOGLE_CLIENT_SECRET;
  const dbKey = provider === "ADS" ? "GOOGLE_ADS_REFRESH_TOKEN" : "GSC_REFRESH_TOKEN";
  const successParam = provider === "ADS" ? "google_ads_connected" : "gsc_connected";

  if (!clientId || !clientSecret || !GOOGLE_REDIRECT_URI) {
    return new NextResponse(`Google OAuth configuration missing for ${provider}`, { status: 500 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // We strictly need the refresh token. If it's missing, they need to re-auth with prompt=consent
    if (!tokens.refresh_token) {
      return NextResponse.redirect(new URL("/wander-admin?error=no_refresh_token", request.url));
    }

    // Encrypt the refresh token before storing it
    const encryptedToken = encryptString(tokens.refresh_token);

    // Save to SystemConfig
    await prisma.systemConfig.upsert({
      where: { key: dbKey },
      update: { value: encryptedToken },
      create: { key: dbKey, value: encryptedToken },
    });

    return NextResponse.redirect(new URL(`/wander-admin?success=${successParam}`, request.url));
  } catch (err) {
    console.error(`Failed to exchange Google OAuth code for ${provider}:`, err);
    return new NextResponse("Authentication failed", { status: 500 });
  }
}
