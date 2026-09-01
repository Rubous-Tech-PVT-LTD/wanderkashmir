import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Add all the missing columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "RoomType"
        ADD COLUMN IF NOT EXISTS "priceEP" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "priceCP" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "priceMAP" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "extraBedPrice" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "childNoBedPrice" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "extraBedPriceEP" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "extraBedPriceCP" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "extraBedPriceMAP" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "childNoBedPriceEP" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "childNoBedPriceCP" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "childNoBedPriceMAP" DOUBLE PRECISION;
    `);

    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'RoomType'`
    );

    return NextResponse.json({ success: true, message: "Migration applied successfully.", columns: cols });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
