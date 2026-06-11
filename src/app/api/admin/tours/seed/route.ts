import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const popularTours = [
  {
    title: "Kashmir Grand Tour",
    duration: "7 Days / 6 Nights",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    price: 28500,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80",
    category: "Family",
    slug: "kashmir-grand-tour",
  },
  {
    title: "Gulmarg Ski Adventure",
    duration: "4 Days / 3 Nights",
    destinations: ["Gulmarg", "Srinagar"],
    price: 18900,
    image:
      "https://images.unsplash.com/photo-1606115915090-be18fea23ec7?w=500&q=80",
    category: "Adventure",
    slug: "gulmarg-ski-adventure",
  },
  {
    title: "Kashmir Honeymoon Special",
    duration: "6 Days / 5 Nights",
    destinations: ["Srinagar", "Pahalgam", "Sonamarg"],
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
    category: "Honeymoon",
    slug: "kashmir-honeymoon-special",
  },
];

export async function GET() {
  try {
    const existingTours = await prisma.tour.count();
    
    if (existingTours === 0) {
      for (const tour of popularTours) {
        await prisma.tour.create({
          data: {
            title: tour.title,
            slug: tour.slug,
            duration: tour.duration,
            destinations: tour.destinations,
            price: tour.price,
            category: tour.category,
            images: [tour.image],
            maxPersons: 2, // default
          }
        });
      }
      return NextResponse.json({ message: "Seeded successfully" });
    }
    
    return NextResponse.json({ message: "Tours already exist in database." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
