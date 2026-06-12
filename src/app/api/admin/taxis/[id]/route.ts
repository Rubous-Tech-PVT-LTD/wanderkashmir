import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const rateCard = await prisma.taxiRateCard.update({
      where: { id },
      data: {
        place: body.place,
        rates: body.rates,
      }
    });
    return NextResponse.json(rateCard);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update rate card" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await prisma.taxiRateCard.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete rate card" }, { status: 500 });
  }
}
