import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tours = await prisma.tour.findMany({
      include: {
        stays: {
          include: {
            property: { select: { id: true, name: true, location: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    return NextResponse.json(tours);
  } catch (error: any) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      duration,
      destinations,
      price,
      category,
      maxPersons,
      images,
      overview,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      originalPrice,
      isLive,
    } = body;

    // Validate accommodation stays if provided
    if (Array.isArray(body.stays) && body.stays.length > 0) {
      for (const s of body.stays) {
        if (s.propertyId && typeof s.propertyId === "string" && s.propertyId.trim() !== "") {
          const property = await prisma.property.findUnique({
            where: { id: s.propertyId },
            select: { id: true, name: true, location: true, isApproved: true, status: true },
          });

          if (!property) {
            return NextResponse.json(
              { error: `Selected property (${s.propertyId}) was not found.` },
              { status: 400 }
            );
          }

          if (!property.isApproved || property.status !== "APPROVED") {
            return NextResponse.json(
              { error: `Property "${property.name}" is not currently approved/active.` },
              { status: 400 }
            );
          }

          const stayDest = (s.destination || "").trim().toLowerCase();
          const propLoc = (property.location || "").trim().toLowerCase();
          const isMatch =
            propLoc.includes(stayDest) ||
            stayDest.includes(propLoc) ||
            (stayDest.includes("srinagar") && (propLoc.includes("srinagar") || propLoc.includes("dal lake") || propLoc.includes("nigeen"))) ||
            (stayDest.includes("gulmarg") && propLoc.includes("gulmarg")) ||
            (stayDest.includes("pahalgam") && propLoc.includes("pahalgam")) ||
            (stayDest.includes("sonamarg") && propLoc.includes("sonamarg"));

          if (!isMatch) {
            return NextResponse.json(
              {
                error: `Property "${property.name}" (${property.location}) is incompatible with destination "${s.destination}".`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Sync with TourCategory if a matching record exists
    let categoryId: string | null = null;
    if (category && typeof category === "string") {
      const trimmedCategory = category.trim();
      const matchedCategory = await prisma.tourCategory.findFirst({
        where: {
          OR: [
            { name: { equals: trimmedCategory, mode: "insensitive" } },
            { slug: { equals: trimmedCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-"), mode: "insensitive" } }
          ]
        }
      });
      if (matchedCategory) {
        categoryId = matchedCategory.id;
      }
    }

    const tour = await prisma.tour.create({
      data: {
        title,
        slug,
        duration,
        destinations: Array.isArray(destinations) ? destinations : [],
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        categoryId,
        maxPersons: parseInt(maxPersons),
        images: Array.isArray(images) ? images : [],
        overview,
        highlights: Array.isArray(highlights) ? highlights : [],
        inclusions: Array.isArray(inclusions) ? inclusions : [],
        exclusions: Array.isArray(exclusions) ? exclusions : [],
        itinerary: itinerary ? itinerary : null,
        isLive: typeof isLive === "boolean" ? isLive : true,
      },
    });

    if (Array.isArray(body.stays) && body.stays.length > 0) {
      await prisma.tourStay.createMany({
        data: body.stays.map((s: any, idx: number) => ({
          tourId: tour.id,
          destination: (s.destination || "Kashmir").trim(),
          stayType: s.stayType || null,
          propertyId: s.propertyId && s.propertyId.trim() !== "" ? s.propertyId : null,
          nights: Math.max(1, Number(s.nights) || 1),
          displayOrder: s.displayOrder !== undefined ? Number(s.displayOrder) : idx + 1,
        })),
      });
    }

    const finalTour = await prisma.tour.findUnique({
      where: { id: tour.id },
      include: {
        stays: {
          include: {
            property: { select: { id: true, name: true, location: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json(finalTour || tour);
  } catch (error: any) {
    console.error("Error creating tour:", error);
    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    );
  }
}
