import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const rateCards = await prisma.taxiRateCard.findMany({
      orderBy: { place: 'asc' }
    });
    return NextResponse.json(rateCards);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rate cards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rateCard = await prisma.taxiRateCard.create({
      data: {
        place: body.place,
        rates: body.rates,
      }
    });
    return NextResponse.json(rateCard);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create rate card" }, { status: 500 });
  }
}
