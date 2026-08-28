import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.NODE_ENV === "production" 
  ? "https://www.wanderkashmir.com/api/auth/google/callback" 
  : process.env.GOOGLE_REDIRECT_URI;

export async function GET() {
  const session = await getAdminSession();
  
  if (!session || session.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return new NextResponse("Google OAuth configuration missing", { status: 500 });
  }

  // Generate a random state for CSRF protection
  const state = crypto.randomBytes(32).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", "https://www.googleapis.com/auth/webmasters.readonly");
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");
  authUrl.searchParams.append("state", state);

  return NextResponse.redirect(authUrl.toString());
}
