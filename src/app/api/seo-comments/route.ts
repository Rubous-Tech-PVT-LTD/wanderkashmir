import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { seoPageId, name, email, rating, comment } = data;

    if (!seoPageId || !name || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newComment = await prisma.seoPageComment.create({
      data: {
        seoPageId,
        name,
        email,
        rating: rating || 5,
        comment,
      },
    });

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error: any) {
    console.error("Error submitting comment:", error);
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 });
  }
}
