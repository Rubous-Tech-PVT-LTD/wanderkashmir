import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const roomTypes = await prisma.$queryRawUnsafe(
      `SELECT id, name, "priceEP", "priceCP", "extraBedPrice" FROM "RoomType" WHERE "propertyId" = 'cmtikvzum0001mfgk0rdv5194'`
    );
    return NextResponse.json({ success: true, roomTypes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
