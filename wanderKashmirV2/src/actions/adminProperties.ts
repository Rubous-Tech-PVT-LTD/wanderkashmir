"use server";

import prisma from "@/lib/prisma";
import { PropertyType } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface PropertyFormInput {
  name: string;
  location: string;
  description?: string | null;
  pricePerNight: number;
  propertyType: "HOTEL" | "RESORT" | "HOMESTAY" | "HOUSEBOAT";
  vendorProfileId: string;
  images: string[];
  amenities: string[];
  bedrooms: number;
  beds: number;
  guests: number;
  totalRooms: number;
  availableRooms: number;
  breakfastIncluded: boolean;
  dinnerIncluded: boolean;
  bedDetails?: string | null;
  googlePlaceId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  isApproved?: boolean;
  rejectionReason?: string | null;
}

export interface RoomTypeFormInput {
  name: string;
  description?: string | null;
  basePrice: number;
  capacity: number;
  totalUnits: number;
  priceEP?: number | null;
  priceCP?: number | null;
  priceMAP?: number | null;
  extraBedPrice?: number | null;
  childNoBedPrice?: number | null;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const ALLOWED_PROPERTY_TYPES: PropertyType[] = [
  "HOTEL",
  "RESORT",
  "HOMESTAY",
  "HOUSEBOAT",
];

/**
 * Server Action: Create a new Property record.
 * Authenticated Admin required. Protected by strict server validation.
 * Safe default: isApproved = false, status = "PENDING".
 */
export async function createPropertyAction(
  input: PropertyFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    // 1. Validation
    const name = (input.name || "").trim();
    if (name.length < 3) {
      return { success: false, error: "Property name must be at least 3 characters." };
    }

    const location = (input.location || "").trim();
    if (location.length < 2) {
      return { success: false, error: "Location must be at least 2 characters (e.g. 'Pahalgam, Kashmir')." };
    }

    const pricePerNight = Number(input.pricePerNight);
    if (isNaN(pricePerNight) || pricePerNight <= 0) {
      return { success: false, error: "Starting price per night must be a positive number." };
    }

    if (!ALLOWED_PROPERTY_TYPES.includes(input.propertyType as PropertyType)) {
      return {
        success: false,
        error: `Invalid property type. Must be one of: ${ALLOWED_PROPERTY_TYPES.join(", ")}`,
      };
    }

    const vendorProfileId = (input.vendorProfileId || "").trim();
    if (!vendorProfileId) {
      return { success: false, error: "An associated vendor profile is required." };
    }

    // Verify vendor exists
    const vendorExists = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { id: true },
    });
    if (!vendorExists) {
      return { success: false, error: "The selected vendor profile does not exist." };
    }

    // Sanitize image URLs
    const sanitizedImages = (Array.isArray(input.images) ? input.images : [])
      .map((img) => (typeof img === "string" ? img.trim() : ""))
      .filter((img) => img.startsWith("http://") || img.startsWith("https://"));

    // Sanitize amenities
    const sanitizedAmenities = (Array.isArray(input.amenities) ? input.amenities : [])
      .map((a) => (typeof a === "string" ? a.trim() : ""))
      .filter((a) => a.length > 0);

    const bedrooms = Math.max(1, parseInt(String(input.bedrooms || 1), 10) || 1);
    const beds = Math.max(1, parseInt(String(input.beds || 1), 10) || 1);
    const guests = Math.max(1, parseInt(String(input.guests || 2), 10) || 2);
    const totalRooms = Math.max(1, parseInt(String(input.totalRooms || 1), 10) || 1);
    const availableRooms = Math.max(0, parseInt(String(input.availableRooms || totalRooms), 10) || totalRooms);

    // 2. Safe default create: non-public until explicitly approved
    const property = await prisma.property.create({
      data: {
        name,
        location,
        description: input.description?.trim() || null,
        pricePerNight,
        propertyType: input.propertyType as PropertyType,
        vendorProfileId,
        images: sanitizedImages,
        amenities: sanitizedAmenities,
        bedrooms,
        beds,
        guests,
        totalRooms,
        availableRooms,
        breakfastIncluded: Boolean(input.breakfastIncluded),
        dinnerIncluded: Boolean(input.dinnerIncluded),
        bedDetails: input.bedDetails?.trim() || null,
        googlePlaceId: input.googlePlaceId?.trim() || null,
        latitude: input.latitude ? Number(input.latitude) : null,
        longitude: input.longitude ? Number(input.longitude) : null,
        isApproved: false,
        status: "PENDING",
      },
      select: { id: true },
    });

    revalidatePath("/stays");
    revalidatePath("/admin/properties");

    return { success: true, data: { id: property.id } };
  } catch (error) {
    console.error("Error creating property:", error);
    return { success: false, error: "Failed to create property. Please verify your inputs." };
  }
}

/**
 * Server Action: Update an existing Property.
 * Whitelists allowed CMS fields to prevent mass assignment vulnerabilities.
 */
export async function updatePropertyAction(
  id: string,
  input: PropertyFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || id.trim() === "") {
      return { success: false, error: "Invalid Property ID." };
    }

    // Verify property exists
    const existing = await prisma.property.findUnique({
      where: { id },
      select: { id: true, name: true, isApproved: true, status: true },
    });
    if (!existing) {
      return { success: false, error: "Property not found." };
    }

    // Validation
    const name = (input.name || "").trim();
    if (name.length < 3) {
      return { success: false, error: "Property name must be at least 3 characters." };
    }

    const location = (input.location || "").trim();
    if (location.length < 2) {
      return { success: false, error: "Location must be at least 2 characters." };
    }

    const pricePerNight = Number(input.pricePerNight);
    if (isNaN(pricePerNight) || pricePerNight <= 0) {
      return { success: false, error: "Starting price per night must be a positive number." };
    }

    if (!ALLOWED_PROPERTY_TYPES.includes(input.propertyType as PropertyType)) {
      return {
        success: false,
        error: `Invalid property type. Must be one of: ${ALLOWED_PROPERTY_TYPES.join(", ")}`,
      };
    }

    // Sanitize image URLs
    const sanitizedImages = (Array.isArray(input.images) ? input.images : [])
      .map((img) => (typeof img === "string" ? img.trim() : ""))
      .filter((img) => img.startsWith("http://") || img.startsWith("https://"));

    // Sanitize amenities
    const sanitizedAmenities = (Array.isArray(input.amenities) ? input.amenities : [])
      .map((a) => (typeof a === "string" ? a.trim() : ""))
      .filter((a) => a.length > 0);

    const bedrooms = Math.max(1, parseInt(String(input.bedrooms || 1), 10) || 1);
    const beds = Math.max(1, parseInt(String(input.beds || 1), 10) || 1);
    const guests = Math.max(1, parseInt(String(input.guests || 2), 10) || 2);
    const totalRooms = Math.max(1, parseInt(String(input.totalRooms || 1), 10) || 1);
    const availableRooms = Math.max(0, parseInt(String(input.availableRooms || totalRooms), 10) || totalRooms);

    // Whitelisted update only
    await prisma.property.update({
      where: { id },
      data: {
        name,
        location,
        description: input.description?.trim() || null,
        pricePerNight,
        propertyType: input.propertyType as PropertyType,
        images: sanitizedImages,
        amenities: sanitizedAmenities,
        bedrooms,
        beds,
        guests,
        totalRooms,
        availableRooms,
        breakfastIncluded: Boolean(input.breakfastIncluded),
        dinnerIncluded: Boolean(input.dinnerIncluded),
        bedDetails: input.bedDetails?.trim() || null,
        googlePlaceId: input.googlePlaceId?.trim() || null,
        latitude: input.latitude ? Number(input.latitude) : null,
        longitude: input.longitude ? Number(input.longitude) : null,
      },
    });

    // Revalidate public Stays routes & sitemap
    revalidatePath("/stays");
    revalidatePath(`/stays/${id}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${id}`);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, error: "Failed to update property details." };
  }
}

/**
 * Server Action: Controlled Approval / Suspension workflow.
 * Approves (sets isApproved: true, status: "APPROVED") or Suspends/Unapproves (isApproved: false, status: "SUSPENDED").
 */
export async function togglePropertyApprovalAction(
  id: string,
  approve: boolean,
  reason?: string
): Promise<ActionResult<{ id: string; isApproved: boolean; status: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || id.trim() === "") {
      return { success: false, error: "Invalid Property ID." };
    }

    const existing = await prisma.property.findUnique({
      where: { id },
      select: { id: true, name: true, isApproved: true, status: true },
    });
    if (!existing) {
      return { success: false, error: "Property not found." };
    }

    const newStatus = approve ? "APPROVED" : "SUSPENDED";
    const newIsApproved = approve;
    const rejectionReason = approve ? null : reason?.trim() || "Unapproved by administrator.";

    await prisma.property.update({
      where: { id },
      data: {
        isApproved: newIsApproved,
        status: newStatus,
        rejectionReason,
      },
    });

    // Revalidation
    revalidatePath("/stays");
    revalidatePath(`/stays/${id}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${id}`);

    return {
      success: true,
      data: { id, isApproved: newIsApproved, status: newStatus },
    };
  } catch (error) {
    console.error("Error toggling property approval:", error);
    return { success: false, error: "Failed to update property approval status." };
  }
}

/**
 * Server Action: Add a RoomType to an existing Property.
 */
export async function addRoomTypeAction(
  propertyId: string,
  input: RoomTypeFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!propertyId || propertyId.trim() === "") {
      return { success: false, error: "Invalid Property ID." };
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property) {
      return { success: false, error: "Parent property does not exist." };
    }

    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Room name must be at least 2 characters." };
    }

    const basePrice = Number(input.basePrice);
    if (isNaN(basePrice) || basePrice <= 0) {
      return { success: false, error: "Base price must be a positive number." };
    }

    const capacity = Math.max(1, parseInt(String(input.capacity || 2), 10) || 2);
    const totalUnits = Math.max(1, parseInt(String(input.totalUnits || 1), 10) || 1);

    const parseNum = (val: unknown) => {
      if (val === undefined || val === null || val === "") return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    const roomType = await prisma.roomType.create({
      data: {
        propertyId,
        name,
        description: input.description?.trim() || null,
        basePrice,
        capacity,
        totalUnits,
        priceEP: parseNum(input.priceEP),
        priceCP: parseNum(input.priceCP),
        priceMAP: parseNum(input.priceMAP),
        extraBedPrice: parseNum(input.extraBedPrice),
        childNoBedPrice: parseNum(input.childNoBedPrice),
      },
      select: { id: true },
    });

    revalidatePath(`/stays/${propertyId}`);
    revalidatePath(`/admin/properties/${propertyId}`);

    return { success: true, data: { id: roomType.id } };
  } catch (error) {
    console.error("Error creating room type:", error);
    return { success: false, error: "Failed to add room type." };
  }
}

/**
 * Server Action: Update an existing RoomType.
 */
export async function updateRoomTypeAction(
  roomTypeId: string,
  input: RoomTypeFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!roomTypeId || roomTypeId.trim() === "") {
      return { success: false, error: "Invalid Room Type ID." };
    }

    const existing = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: { id: true, propertyId: true },
    });
    if (!existing) {
      return { success: false, error: "Room type not found." };
    }

    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Room name must be at least 2 characters." };
    }

    const basePrice = Number(input.basePrice);
    if (isNaN(basePrice) || basePrice <= 0) {
      return { success: false, error: "Base price must be a positive number." };
    }

    const capacity = Math.max(1, parseInt(String(input.capacity || 2), 10) || 2);
    const totalUnits = Math.max(1, parseInt(String(input.totalUnits || 1), 10) || 1);

    const parseNum = (val: unknown) => {
      if (val === undefined || val === null || val === "") return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    await prisma.roomType.update({
      where: { id: roomTypeId },
      data: {
        name,
        description: input.description?.trim() || null,
        basePrice,
        capacity,
        totalUnits,
        priceEP: parseNum(input.priceEP),
        priceCP: parseNum(input.priceCP),
        priceMAP: parseNum(input.priceMAP),
        extraBedPrice: parseNum(input.extraBedPrice),
        childNoBedPrice: parseNum(input.childNoBedPrice),
      },
    });

    revalidatePath(`/stays/${existing.propertyId}`);
    revalidatePath(`/admin/properties/${existing.propertyId}`);

    return { success: true, data: { id: roomTypeId } };
  } catch (error) {
    console.error("Error updating room type:", error);
    return { success: false, error: "Failed to update room type." };
  }
}

/**
 * Server Action: Safely delete a RoomType.
 * Prevents destructive deletion if historical bookings exist.
 */
export async function deleteRoomTypeAction(
  roomTypeId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!roomTypeId || roomTypeId.trim() === "") {
      return { success: false, error: "Invalid Room Type ID." };
    }

    const existing = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Room type not found." };
    }

    if (existing._count.bookings > 0) {
      return {
        success: false,
        error: `Cannot delete room: ${existing._count.bookings} historical booking(s) exist. Set Total Units to 0 instead.`,
      };
    }

    await prisma.roomType.delete({
      where: { id: roomTypeId },
    });

    revalidatePath(`/stays/${existing.propertyId}`);
    revalidatePath(`/admin/properties/${existing.propertyId}`);

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error deleting room type:", error);
    return { success: false, error: "Failed to delete room type." };
  }
}
