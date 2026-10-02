import { NextRequest, NextResponse } from "next/server";
import { submitCustomTripRequest } from "@/actions/customTrip";
import { extractClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req.headers);
    const body = await req.json();
    const result = await submitCustomTripRequest(body, { ip: clientIp });

    if (!result.success) {
      const status = result.isRateLimited ? 429 : 400;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("API error submitting custom trip request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process request. Please try again.",
      },
      { status: 500 }
    );
  }
}
