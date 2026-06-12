import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const images = await prisma.taxiTypeImage.findMany();
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type, imageUrl } = await request.json();
    const upsertedImage = await prisma.taxiTypeImage.upsert({
      where: { type },
      update: { imageUrl },
      create: { type, imageUrl }
    });
    return NextResponse.json(upsertedImage);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}
