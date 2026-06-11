import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = body.type; // 'admin' or 'vendor'

    const cookieStore = await cookies();

    if (type === 'admin') {
      cookieStore.delete("admin_session");
    } else if (type === 'vendor') {
      cookieStore.delete("vendor_session");
    } else {
      // Delete both if not specified just in case
      cookieStore.delete("admin_session");
      cookieStore.delete("vendor_session");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
