"use server";

import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
