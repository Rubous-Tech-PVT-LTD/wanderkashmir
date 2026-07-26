"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomTourRequest(formData: {
  name: string;
  phone: string;
  email?: string;
  travelDates?: string;
  guestsCount: string;
  destinations: string[];
  hotelType: string;
  cabType: string;
  specialRequests?: string;
}) {
  try {
    if (!formData.name || !formData.phone || !formData.guestsCount) {
      return { success: false, error: "Please fill in required fields (Name, Phone, Guests)." };
    }

    const inquiry = await prisma.customTourRequest.create({
      data: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        travelDates: formData.travelDates || null,
        guestsCount: formData.guestsCount,
        destinations: formData.destinations || [],
        hotelType: formData.hotelType || "3 Star Standard",
        cabType: formData.cabType || "Sedan / SUV",
        specialRequests: formData.specialRequests || null,
        status: "PENDING",
      },
    });

    revalidatePath("/wander-admin");
    return { success: true, inquiry };
  } catch (error: any) {
    console.error("Error creating custom tour request:", error);
    return { success: false, error: "Failed to submit request. Please try again or WhatsApp us directly." };
  }
}

export async function getCustomTourRequests() {
  try {
    const inquiries = await prisma.customTourRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, inquiries };
  } catch (error: any) {
    console.error("Error fetching custom tour requests:", error);
    return { success: false, inquiries: [] };
  }
}

export async function updateCustomTourStatus(id: string, status: string, adminNotes?: string) {
  try {
    const updated = await prisma.customTourRequest.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });
    revalidatePath("/wander-admin");
    return { success: true, inquiry: updated };
  } catch (error: any) {
    console.error("Error updating custom tour request:", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function deleteCustomTourRequest(id: string) {
  try {
    await prisma.customTourRequest.delete({
      where: { id },
    });
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting custom tour request:", error);
    return { success: false, error: "Failed to delete request." };
  }
}
