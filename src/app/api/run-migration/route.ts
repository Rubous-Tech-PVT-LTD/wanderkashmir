import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ONE-TIME migration endpoint — delete after use
// Protected by a secret token
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (token !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // Verify columns
    const cols: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'RoomType'
      ORDER BY ordinal_position;
    `);

    return NextResponse.json({
      success: true,
      message: "Migration applied successfully. DELETE THIS ROUTE NOW.",
      columns: cols.map((c) => c.column_name),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
