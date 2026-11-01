"use server";

import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";

export interface DestinationItem {
  id: string;
  name: string;
  image: string;
  link: string;
  order?: number;
  isActive?: boolean;
}

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "destinations.json");

const DEFAULT_DESTINATIONS: DestinationItem[] = [
  {
    id: "srinagar",
    name: "Srinagar",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Srinagar",
    order: 1,
    isActive: true
  },
  {
    id: "gulmarg",
    name: "Gulmarg",
    image: "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Gulmarg",
    order: 2,
    isActive: true
  },
  {
    id: "pahalgam",
    name: "Pahalgam",
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Pahalgam",
    order: 3,
    isActive: true
  },
  {
    id: "sonamarg",
    name: "Sonamarg",
    image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Sonamarg",
    order: 4,
    isActive: true
  },
  {
    id: "gurez",
    name: "Gurez Valley",
    image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Gurez",
    order: 5,
    isActive: true
  },
  {
    id: "doodhpathri",
    name: "Doodhpathri",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Doodhpathri",
    order: 6,
    isActive: true
  },
  {
    id: "dal-lake",
    name: "Dal Lake",
    image: "https://images.unsplash.com/photo-1605537964076-2cb0caf302d9?auto=format&fit=crop&q=80&w=400",
    link: "/stays?type=houseboat",
    order: 7,
    isActive: true
  },
  {
    id: "leh-ladakh",
    name: "Leh Ladakh",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Ladakh",
    order: 8,
    isActive: true
  },
  {
    id: "yusmarg",
    name: "Yusmarg",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Yusmarg",
    order: 9,
    isActive: true
  },
  {
    id: "aru-valley",
    name: "Aru Valley",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Aru",
    order: 10,
    isActive: true
  },
  {
    id: "betaab-valley",
    name: "Betaab Valley",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Betaab",
    order: 11,
    isActive: true
  },
  {
    id: "kupwara",
    name: "Kupwara",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400",
    link: "/tours?destination=Kupwara",
    order: 12,
    isActive: true
  }
];

async function readFromFile(): Promise<DestinationItem[]> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // ignore read error, will fallback
  }
  return DEFAULT_DESTINATIONS;
}

async function writeToFile(destinations: DestinationItem[]) {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(destinations, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing destinations to file:", err);
  }
}

export async function getDestinations(onlyActive: boolean = false): Promise<DestinationItem[]> {
  // First try reading from DB SystemConfig
  try {
    const cfg = await prisma.systemConfig.findUnique({
      where: { key: "home_destinations" }
    });
    if (cfg && cfg.value) {
      const parsed = JSON.parse(cfg.value) as DestinationItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sorted = parsed.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        return onlyActive ? sorted.filter(d => d.isActive !== false) : sorted;
      }
    }
  } catch (err) {
    console.warn("Could not query DB SystemConfig for destinations, falling back to local file:", err);
  }

  // Fallback to file
  const fileData = await readFromFile();
  const sorted = fileData.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  return onlyActive ? sorted.filter(d => d.isActive !== false) : sorted;
}

export async function saveDestination(data: Partial<DestinationItem> & { name: string; image: string }): Promise<{ success: boolean; error?: string; destination?: DestinationItem }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const current = await getDestinations(false);
    let updatedList: DestinationItem[];

    if (data.id) {
      // Edit existing
      const index = current.findIndex(d => d.id === data.id);
      if (index === -1) {
        return { success: false, error: "Destination not found" };
      }
      const existing = current[index];
      const updated: DestinationItem = {
        ...existing,
        name: data.name.trim(),
        image: data.image.trim(),
        link: (data.link && data.link.trim()) || `/tours?destination=${encodeURIComponent(data.name.trim())}`,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive ?? true,
        order: data.order !== undefined ? data.order : existing.order ?? (index + 1),
      };
      updatedList = [...current];
      updatedList[index] = updated;
    } else {
      // Create new
      const newId = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `dest-${Date.now()}`;
      const newDestination: DestinationItem = {
        id: newId,
        name: data.name.trim(),
        image: data.image.trim(),
        link: (data.link && data.link.trim()) || `/tours?destination=${encodeURIComponent(data.name.trim())}`,
        order: data.order ?? (current.length + 1),
        isActive: data.isActive !== undefined ? data.isActive : true,
      };
      updatedList = [...current, newDestination];
    }

    // Persist to file
    await writeToFile(updatedList);

    // Persist to DB SystemConfig if available
    try {
      await prisma.systemConfig.upsert({
        where: { key: "home_destinations" },
        update: { value: JSON.stringify(updatedList) },
        create: { key: "home_destinations", value: JSON.stringify(updatedList) }
      });
    } catch (dbErr) {
      console.warn("DB update for home_destinations skipped/failed:", dbErr);
    }

    revalidatePath("/");
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save destination:", error);
    return { success: false, error: error?.message || "Failed to save destination" };
  }
}

export async function deleteDestination(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const current = await getDestinations(false);
    const updatedList = current.filter(d => d.id !== id);

    await writeToFile(updatedList);

    try {
      await prisma.systemConfig.upsert({
        where: { key: "home_destinations" },
        update: { value: JSON.stringify(updatedList) },
        create: { key: "home_destinations", value: JSON.stringify(updatedList) }
      });
    } catch (dbErr) {
      console.warn("DB update for delete destination skipped/failed:", dbErr);
    }

    revalidatePath("/");
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete destination:", error);
    return { success: false, error: error?.message || "Failed to delete destination" };
  }
}

export async function reorderDestinations(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const current = await getDestinations(false);
    const map = new Map(current.map(item => [item.id, item]));

    const updatedList: DestinationItem[] = [];
    orderedIds.forEach((id, index) => {
      const item = map.get(id);
      if (item) {
        updatedList.push({ ...item, order: index + 1 });
        map.delete(id);
      }
    });

    // Append any items that were not in orderedIds
    map.forEach(item => {
      updatedList.push({ ...item, order: updatedList.length + 1 });
    });

    await writeToFile(updatedList);

    try {
      await prisma.systemConfig.upsert({
        where: { key: "home_destinations" },
        update: { value: JSON.stringify(updatedList) },
        create: { key: "home_destinations", value: JSON.stringify(updatedList) }
      });
    } catch (dbErr) {
      console.warn("DB update for reorder skipped/failed:", dbErr);
    }

    revalidatePath("/");
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reorder destinations:", error);
    return { success: false, error: error?.message || "Failed to reorder" };
  }
}

// ==========================================
// DESTINATIONS HERO BANNER IMAGE
// ==========================================

export async function getDestinationsHeroImage(): Promise<string | null> {
  try {
    const cfg = await prisma.systemConfig.findUnique({
      where: { key: "destinations_hero_image" }
    });
    return cfg?.value || null;
  } catch (err) {
    console.error("Error fetching destinations hero image:", err);
    return null;
  }
}

export async function setDestinationsHeroImage(url: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    if (url) {
      await prisma.systemConfig.upsert({
        where: { key: "destinations_hero_image" },
        update: { value: url },
        create: { key: "destinations_hero_image", value: url }
      });
    } else {
      await prisma.systemConfig.deleteMany({
        where: { key: "destinations_hero_image" }
      });
    }
    revalidatePath("/destinations");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving destinations hero image:", err);
    return { success: false, error: err?.message || "Failed to save hero image" };
  }
}

// ==========================================
// DESTINATION CATEGORIES & MAPPINGS
// ==========================================

export interface DestinationCategory {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export type DestinationCategoryMapping = Record<string, string[]>;

const DEFAULT_CATEGORIES: DestinationCategory[] = [
  { name: "Alpine Meadows", slug: "alpine-meadows" },
  { name: "Forest & River Valleys", slug: "forest-river-valleys" },
  { name: "Lakes & Waterfronts", slug: "lakes-waterfronts" },
  { name: "Glaciers & High Passes", slug: "glaciers-high-passes" },
  { name: "Heritage & Culture", slug: "heritage-culture" }
];

export async function getDestinationCategories(): Promise<DestinationCategory[]> {
  try {
    const cfg = await prisma.systemConfig.findUnique({
      where: { key: "destination_categories" }
    });
    if (cfg?.value) {
      return JSON.parse(cfg.value);
    }
  } catch (err) {
    console.error("Error getting destination categories:", err);
  }
  return DEFAULT_CATEGORIES;
}

export async function getDestinationCategoryMappings(): Promise<DestinationCategoryMapping> {
  try {
    const cfg = await prisma.systemConfig.findUnique({
      where: { key: "destination_category_mappings" }
    });
    if (cfg?.value) {
      return JSON.parse(cfg.value);
    }
  } catch (err) {
    console.error("Error getting destination category mappings:", err);
  }
  return {};
}

export async function saveDestinationCategoryMappings(mappings: DestinationCategoryMapping): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    await prisma.systemConfig.upsert({
      where: { key: "destination_category_mappings" },
      update: { value: JSON.stringify(mappings) },
      create: { key: "destination_category_mappings", value: JSON.stringify(mappings) }
    });
    revalidatePath("/destinations");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving destination category mappings:", err);
    return { success: false, error: err?.message || "Failed to save category mappings" };
  }
}

// ==========================================
// DESTINATION PLACES MANAGEMENT
// ==========================================

export interface PlaceData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  destination?: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LinkedDestinationPlace {
  id: string;
  destinationId: string;
  placeId: string;
  displayOrder: number;
  place: PlaceData;
}

export async function searchPlaces(query: string = ""): Promise<{ success: boolean; places?: PlaceData[]; error?: string }> {
  try {
    const trimmed = query.trim();
    const places = await prisma.place.findMany({
      where: trimmed
        ? {
            OR: [
              { name: { contains: trimmed, mode: "insensitive" } },
              { slug: { contains: trimmed, mode: "insensitive" } },
              { destination: { contains: trimmed, mode: "insensitive" } },
            ]
          }
        : {},
      orderBy: { name: "asc" },
      take: 50,
    });
    return { success: true, places };
  } catch (err: any) {
    console.error("Error searching places:", err);
    return { success: false, error: err?.message || "Failed to search places" };
  }
}

export async function getDestinationPlaces(destinationId: string): Promise<{ success: boolean; places?: LinkedDestinationPlace[]; error?: string }> {
  try {
    const places = await prisma.destinationPlace.findMany({
      where: { destinationId },
      orderBy: { displayOrder: "asc" },
      include: { place: true }
    });
    return { success: true, places: places as unknown as LinkedDestinationPlace[] };
  } catch (err: any) {
    console.error("Error fetching destination places:", err);
    return { success: false, error: err?.message || "Failed to fetch destination places" };
  }
}

export async function createPlace(data: {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  destination?: string | null;
  status?: string;
}): Promise<{ success: boolean; place?: PlaceData; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    const existing = await prisma.place.findUnique({
      where: { slug: data.slug }
    });
    if (existing) {
      return { success: false, error: `A place with slug "${data.slug}" already exists.` };
    }

    const place = await prisma.place.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        destination: data.destination || null,
        status: data.status || "ACTIVE",
      }
    });
    return { success: true, place };
  } catch (err: any) {
    console.error("Error creating place:", err);
    return { success: false, error: err?.message || "Failed to create place" };
  }
}

export async function updatePlace(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    imageUrl?: string | null;
    destination?: string | null;
    status?: string;
  }
): Promise<{ success: boolean; place?: PlaceData; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    if (!id) {
      return { success: false, error: "Place ID is required" };
    }

    const existing = await prisma.place.findUnique({
      where: { id },
      include: {
        destinationPlaces: {
          include: {
            destination: {
              select: { slug: true },
            },
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Place not found" };
    }

    if (data.name !== undefined && !data.name.trim()) {
      return { success: false, error: "Place name is required" };
    }

    const newSlug = data.slug !== undefined ? data.slug.trim().toLowerCase() : existing.slug;
    if (!newSlug) {
      return { success: false, error: "Valid slug is required" };
    }

    if (newSlug !== existing.slug) {
      const collision = await prisma.place.findUnique({
        where: { slug: newSlug },
      });
      if (collision && collision.id !== id) {
        return { success: false, error: `A place with slug "${newSlug}" already exists.` };
      }
    }

    const updated = await prisma.place.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.slug !== undefined && { slug: newSlug }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.destination !== undefined && { destination: data.destination || null }),
        ...(data.status !== undefined && { status: data.status || "ACTIVE" }),
      },
    });

    // Revalidate parent destinations and child entity routes
    for (const dp of existing.destinationPlaces) {
      const destSlug = dp.destination.slug;
      if (destSlug) {
        revalidatePath(`/destinations/${destSlug}`);
        revalidatePath(`/destinations/${destSlug}/${updated.slug}`);
        if (existing.slug !== updated.slug) {
          revalidatePath(`/destinations/${destSlug}/${existing.slug}`);
        }
      }
    }
    revalidatePath("/destinations");
    revalidatePath("/");

    return { success: true, place: updated };
  } catch (err: any) {
    console.error("Error updating place:", err);
    return { success: false, error: err?.message || "Failed to update place" };
  }
}

export async function saveDestinationPlaces(
  destinationId: string,
  placeIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    if (session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    // 1. Fetch parent destination slug and previously linked place slugs
    const [destination, previousPlaces, newPlaces] = await Promise.all([
      prisma.seoLandingPage.findUnique({
        where: { id: destinationId },
        select: { slug: true },
      }),
      prisma.destinationPlace.findMany({
        where: { destinationId },
        include: { place: { select: { slug: true } } },
      }),
      prisma.place.findMany({
        where: { id: { in: placeIds } },
        select: { slug: true },
      }),
    ]);

    const affectedPlaceSlugs = Array.from(
      new Set([
        ...previousPlaces.map((p) => p.place.slug),
        ...newPlaces.map((p) => p.slug),
      ])
    );

    // 2. Persist updated linked places and ordering in transaction
    await prisma.$transaction([
      prisma.destinationPlace.deleteMany({
        where: { destinationId },
      }),
      prisma.destinationPlace.createMany({
        data: placeIds.map((placeId, index) => ({
          destinationId,
          placeId,
          displayOrder: index,
        })),
      }),
    ]);

    // 3. Revalidate destination index, homepage, parent destination page, and affected child place entity routes
    revalidatePath("/destinations");
    revalidatePath("/");
    if (destination?.slug) {
      revalidatePath(`/destinations/${destination.slug}`);
      for (const placeSlug of affectedPlaceSlugs) {
        revalidatePath(`/destinations/${destination.slug}/${placeSlug}`);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error saving destination places:", err);
    return { success: false, error: err?.message || "Failed to save destination places" };
  }
}

// ==========================================
// FEATURED PROPERTIES & TOURS HELPERS
// ==========================================

export interface SimpleProperty {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  images: string[];
}

export interface SimpleTour {
  id: string;
  title: string;
  slug: string;
  duration: string;
  price: number;
  images: string[];
}

export async function searchProperties(query: string = ""): Promise<{ success: boolean; properties?: SimpleProperty[]; error?: string }> {
  try {
    const trimmed = query.trim();
    const props = await prisma.property.findMany({
      where: {
        isApproved: true,
        ...(trimmed
          ? {
              OR: [
                { name: { contains: trimmed, mode: "insensitive" } },
                { location: { contains: trimmed, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        location: true,
        pricePerNight: true,
        images: true,
      },
      take: 40,
    });
    return { success: true, properties: props };
  } catch (err: any) {
    console.error("Error searching properties:", err);
    return { success: false, error: err?.message || "Failed to search properties" };
  }
}

export async function getPropertiesByIds(ids: string[]): Promise<{ success: boolean; properties?: SimpleProperty[]; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, properties: [] };
    const props = await prisma.property.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        location: true,
        pricePerNight: true,
        images: true,
      },
    });
    const sorted = ids.map(id => props.find(p => p.id === id)).filter(Boolean) as SimpleProperty[];
    return { success: true, properties: sorted };
  } catch (err: any) {
    console.error("Error getting properties by ids:", err);
    return { success: false, error: err?.message || "Failed to get properties" };
  }
}

export async function searchTours(query: string = ""): Promise<{ success: boolean; tours?: SimpleTour[]; error?: string }> {
  try {
    const trimmed = query.trim();
    const tours = await prisma.tour.findMany({
      where: {
        isLive: true,
        ...(trimmed
          ? {
              OR: [
                { title: { contains: trimmed, mode: "insensitive" } },
                { destinations: { has: trimmed } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        price: true,
        images: true,
      },
      take: 40,
    });
    return { success: true, tours };
  } catch (err: any) {
    console.error("Error searching tours:", err);
    return { success: false, error: err?.message || "Failed to search tours" };
  }
}

export async function getToursByIds(ids: string[]): Promise<{ success: boolean; tours?: SimpleTour[]; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, tours: [] };
    const tours = await prisma.tour.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        price: true,
        images: true,
      },
    });
    const sorted = ids.map(id => tours.find(t => t.id === id)).filter(Boolean) as SimpleTour[];
    return { success: true, tours: sorted };
  } catch (err: any) {
    console.error("Error getting tours by ids:", err);
    return { success: false, error: err?.message || "Failed to get tours" };
  }
}
