import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const referer = request.headers.get("referer") || "";
    const isWanderAdmin = referer.includes("/wander-admin");
    const acceptHeader = request.headers.get("accept") || "";

    let response: NextResponse;

    // If client requested JSON response (e.g. from fetch)
    if (acceptHeader.includes("application/json")) {
      response = NextResponse.json({
        success: true,
        redirectUrl: isWanderAdmin ? "/wander-admin/login" : "/admin/login",
      });
    } else {
      // Otherwise redirect to the appropriate login page (303 See Other for POST-redirect-GET)
      const redirectUrl = new URL(isWanderAdmin ? "/wander-admin/login" : "/admin/login", request.url);
      response = NextResponse.redirect(redirectUrl, { status: 303 });
    }

    response.cookies.set({
      name: "admin_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("API Admin logout error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during logout." },
      { status: 500 }
    );
  }
}
