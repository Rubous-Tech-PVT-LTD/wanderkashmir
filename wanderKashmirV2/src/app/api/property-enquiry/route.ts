import { NextRequest, NextResponse } from "next/server";
import { submitPropertyEnquiry } from "@/actions/propertyEnquiry";
import { extractClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req.headers);
    const body = await req.json();
    const result = await submitPropertyEnquiry(
      {
        propertyId: body.propertyId,
        name: body.name,
        phone: body.phone,
        email: body.email,
        dates: body.dates,
        guests: body.guests,
        message: body.message,
      },
      { ip: clientIp }
    );

    if (!result.success) {
      const status = result.isRateLimited ? 429 : 400;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("API error submitting property enquiry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process enquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}
