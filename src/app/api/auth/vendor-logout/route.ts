import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("vendor_session");
  
  // Return 303 See Other so the browser redirects with a GET request
  return NextResponse.redirect(new URL("/partner", request.url), 303);
}
