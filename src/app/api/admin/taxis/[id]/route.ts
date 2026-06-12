import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const rateCard = await prisma.taxiRateCard.update({
      where: { id: params.id },
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.taxiRateCard.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete rate card" }, { status: 500 });
  }
}
