import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "Server is awake!", 
    timestamp: new Date().toISOString() 
  });
}
