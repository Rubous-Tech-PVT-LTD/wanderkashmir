"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveGuideProfile(vendorProfileId: string, data: any) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify vendor belongs to user
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId }
    });

    if (!vendor || vendor.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Find existing GuideProfile
    const existingGuide = await prisma.guideProfile.findFirst({
      where: { vendorProfileId: vendor.id }
    });

    const languagesArray = data.languages.split(',').map((l: string) => l.trim());
    const specialtiesArray = data.specializations.split(',').map((s: string) => s.trim());

    let guideProfile;
    if (existingGuide) {
      guideProfile = await prisma.guideProfile.update({
        where: { id: existingGuide.id },
        data: {
          bio: data.bio,
          languages: languagesArray,
          specialties: specialtiesArray,
          pricePerDay: data.dailyRate,
          experienceYears: data.experienceYears,
          // instantBooking: data.instantBooking
        }
      });
    } else {
      guideProfile = await prisma.guideProfile.create({
        data: {
          vendorProfileId: vendor.id,
          isApproved: true, 
          status: "APPROVED",
          bio: data.bio,
          languages: languagesArray,
          specialties: specialtiesArray,
          pricePerDay: data.dailyRate,
          experienceYears: data.experienceYears,
        }
      });
    }

    revalidatePath("/partner/Guide");
    revalidatePath("/guides");
    
    return { success: true, guideProfile };

  } catch (error) {
    console.error("Error saving guide profile:", error);
    return { success: false, error: "Failed to save profile" };
  }
}
