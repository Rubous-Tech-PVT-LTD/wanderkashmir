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

    // Validate transport segments if provided
    if (Array.isArray(data.transports) && data.transports.length > 0) {
      for (const t of data.transports) {
        if (t.vehicleId && typeof t.vehicleId === "string" && t.vehicleId.trim() !== "") {
          const vehicle = await prisma.vehicle.findUnique({
            where: { id: t.vehicleId },
            select: { id: true, make: true, model: true, isApproved: true, status: true },
          });

          if (!vehicle) {
            return NextResponse.json(
              { error: `Selected vehicle (${t.vehicleId}) was not found.` },
              { status: 400 }
            );
          }

          if (!vehicle.isApproved && vehicle.status !== "APPROVED" && vehicle.status !== "LIVE") {
            return NextResponse.json(
              { error: `Vehicle "${vehicle.model}" is not currently approved/live.` },
              { status: 400 }
            );
          }
        }

        if (t.driverId && typeof t.driverId === "string" && t.driverId.trim() !== "") {
          const driver = await prisma.driver.findUnique({
            where: { id: t.driverId },
            select: { id: true, name: true, status: true },
          });

          if (!driver) {
            return NextResponse.json(
              { error: `Selected driver (${t.driverId}) was not found.` },
              { status: 400 }
            );
          }

          if (driver.status !== "ACTIVE") {
            return NextResponse.json(
              { error: `Driver "${driver.name}" is not currently active.` },
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

    if (Array.isArray(data.transports)) {
      await prisma.tourTransport.deleteMany({ where: { tourId: id } });
      if (data.transports.length > 0) {
        await prisma.tourTransport.createMany({
          data: data.transports.map((t: any, idx: number) => ({
            tourId: id,
            origin: (t.origin || "Srinagar").trim(),
            destination: (t.destination || "Kashmir").trim(),
            purpose: t.purpose || "Transfer",
            vehicleId: t.vehicleId && t.vehicleId.trim() !== "" ? t.vehicleId : null,
            driverId: t.driverId && t.driverId.trim() !== "" ? t.driverId : null,
            displayOrder: t.displayOrder !== undefined ? Number(t.displayOrder) : idx + 1,
            status: t.status || "ACTIVE",
          })),
        });
      }
    }

    if (Array.isArray(data.experiences)) {
      await prisma.tourExperience.deleteMany({ where: { tourId: id } });
      if (data.experiences.length > 0) {
        await prisma.tourExperience.createMany({
          data: data.experiences.map((exp: any, idx: number) => ({
            tourId: id,
            experienceId: exp.experienceId,
            isOptional: !!exp.isOptional,
            dayNumber: exp.dayNumber ? Number(exp.dayNumber) : null,
            displayOrder: exp.displayOrder !== undefined ? Number(exp.displayOrder) : idx + 1,
          })),
        });
      }
    }

    // Validate and synchronize Travel Guides (must be SeoLandingPage with type = BLOG and PUBLISHED)
    if (Array.isArray(data.travelGuides)) {
      const submittedGuides = data.travelGuides.filter((g: any) => g && g.guideId);
      const uniqueGuideIds = Array.from(new Set(submittedGuides.map((g: any) => g.guideId)));

      if (uniqueGuideIds.length > 0) {
        const validGuides = await prisma.seoLandingPage.findMany({
          where: {
            id: { in: uniqueGuideIds },
            type: "BLOG",
            workflowState: "PUBLISHED",
          },
          select: { id: true, title: true, type: true, workflowState: true },
        });

        const validGuideMap = new Map(validGuides.map((g) => [g.id, g]));

        for (const gId of uniqueGuideIds) {
          if (!validGuideMap.has(gId)) {
            return NextResponse.json(
              { error: `Selected travel guide (${gId}) is invalid, not of type BLOG, or not published.` },
              { status: 400 }
            );
          }
        }

        await prisma.tourTravelGuide.deleteMany({ where: { tourId: id } });

        await prisma.tourTravelGuide.createMany({
          data: uniqueGuideIds.map((gId, idx) => {
            const item = submittedGuides.find((g: any) => g.guideId === gId);
            return {
              tourId: id,
              guideId: gId,
              displayOrder: item && typeof item.displayOrder === "number" ? item.displayOrder : idx + 1,
            };
          }),
        });
      } else {
        await prisma.tourTravelGuide.deleteMany({ where: { tourId: id } });
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
        transports: {
          include: {
            vehicle: { select: { id: true, make: true, model: true, type: true, capacity: true } },
            driver: { select: { id: true, name: true, status: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
        experiences: {
          include: {
            experience: true,
          },
          orderBy: { displayOrder: "asc" },
        },
        travelGuides: {
          include: {
            guide: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                description: true,
                type: true,
                workflowState: true,
              },
            },
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
