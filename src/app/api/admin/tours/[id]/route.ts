import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate accommodation stays if provided
    if (Array.isArray(data.stays) && data.stays.length > 0) {
      for (const s of data.stays) {
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

    // Sync with TourCategory if matching record exists
    let categoryId: string | null | undefined = undefined;
    if (data.category && typeof data.category === "string") {
      const trimmedCategory = data.category.trim();
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

    const updatedTour = await prisma.tour.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        duration: data.duration,
        destinations: Array.isArray(data.destinations) ? data.destinations : [],
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        category: data.category,
        ...(categoryId !== undefined ? { categoryId } : {}),
        maxPersons: parseInt(data.maxPersons) || 1,
        images: Array.isArray(data.images) ? data.images : [],
        overview: data.overview,
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        inclusions: Array.isArray(data.inclusions) ? data.inclusions : [],
        exclusions: Array.isArray(data.exclusions) ? data.exclusions : [],
        itinerary: data.itinerary ? data.itinerary : null,
        isLive: typeof data.isLive === 'boolean' ? data.isLive : true,
      }
    });

    // In-place TourStay synchronization preserving existing IDs
    if (Array.isArray(data.stays)) {
      const existingStays = await prisma.tourStay.findMany({
        where: { tourId: id },
      });
      const existingStayMap = new Map(existingStays.map((es) => [es.id, es]));
      const submittedStayIds = new Set(data.stays.map((s: any) => s.id).filter(Boolean));

      // Remove only stays that were deleted from the list
      const toDeleteIds = existingStays
        .filter((es) => !submittedStayIds.has(es.id))
        .map((es) => es.id);
      if (toDeleteIds.length > 0) {
        await prisma.tourStay.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      // Upsert/update stays preserving existing IDs
      for (let idx = 0; idx < data.stays.length; idx++) {
        const s = data.stays[idx];
        const destination = (s.destination || "Kashmir").trim();
        const stayType = s.stayType || null;
        const propertyId = s.propertyId && s.propertyId.trim() !== "" ? s.propertyId : null;
        const nights = Math.max(1, Number(s.nights) || 1);
        const displayOrder = s.displayOrder !== undefined ? Number(s.displayOrder) : idx + 1;

        if (s.id && existingStayMap.has(s.id)) {
          await prisma.tourStay.update({
            where: { id: s.id },
            data: {
              destination,
              stayType,
              propertyId,
              nights,
              displayOrder,
            },
          });
        } else {
          await prisma.tourStay.create({
            data: {
              tourId: id,
              destination,
              stayType,
              propertyId,
              nights,
              displayOrder,
            },
          });
        }
      }
    }

    const finalTour = await prisma.tour.findUnique({
      where: { id },
      include: {
        stays: {
          include: {
            property: { select: { id: true, name: true, location: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json(finalTour || updatedTour);
  } catch (error: any) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.tour.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tour deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting tour:", error);
    return NextResponse.json(
      { error: "Failed to delete tour" },
      { status: 500 }
    );
  }
}
