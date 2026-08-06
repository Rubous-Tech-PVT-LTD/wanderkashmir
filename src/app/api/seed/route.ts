import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const popularTours = [
  {
    id: "t1",
    title: "Kashmir Grand Tour",
    duration: "7 Days / 6 Nights",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    price: 28500,
    rating: 4.9,
    reviews: 412,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80",
    category: "Family",
    slug: "kashmir-grand-tour",
  },
  {
    id: "t2",
    title: "Gulmarg Ski Adventure",
    duration: "4 Days / 3 Nights",
    destinations: ["Gulmarg", "Srinagar"],
    price: 18900,
    rating: 4.8,
    reviews: 231,
    image:
      "https://images.unsplash.com/photo-1606115915090-be18fea23ec7?w=500&q=80",
    category: "Adventure",
    slug: "gulmarg-ski-adventure",
  },
  {
    id: "t3",
    title: "Kashmir Honeymoon Special",
    duration: "6 Days / 5 Nights",
    destinations: ["Srinagar", "Pahalgam", "Sonamarg"],
    price: 45000,
    rating: 5.0,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
    category: "Honeymoon",
    slug: "kashmir-honeymoon-special",
  },
];

export async function GET(req: Request) {
  try {
    // Basic security check to prevent abuse. Require a secret key in query params.
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Replace 'mysecretseeder' with a stronger key or use env variables in production.
    if (secret !== "wanderkashmir2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingTours = await prisma.tour.count();
    if (existingTours > 0) {
      return NextResponse.json({ message: "Database already seeded with tours." });
    }

    const createdTours = [];
    for (const tour of popularTours) {
      const created = await prisma.tour.create({
        data: {
          title: tour.title,
          slug: tour.slug,
          duration: tour.duration,
          destinations: tour.destinations,
          price: tour.price,
          category: tour.category,
          images: [tour.image],
          maxPersons: 2,
        }
      });
      createdTours.push(created);
    }

    return NextResponse.json({ success: true, message: "Successfully seeded demo tours.", count: createdTours.length });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
