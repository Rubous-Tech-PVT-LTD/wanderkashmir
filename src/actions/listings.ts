"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { PropertyData, propertySchema, VehicleData, vehicleSchema } from "@/lib/validations";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function addProperty(data: PropertyData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const parsedData = propertySchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "Invalid data provided." };
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: userId }
    });

    if (!vendorProfile) {
      return { success: false, error: "Vendor profile not found." };
    }

    const property = await prisma.property.create({
      data: {
        vendorProfileId: vendorProfile.id,
        name: parsedData.data.name,
        location: parsedData.data.location,
        description: parsedData.data.description,
        pricePerNight: parsedData.data.pricePerNight,
        images: parsedData.data.images || [],
        amenities: parsedData.data.amenities || [],
        totalRooms: parsedData.data.totalRooms ?? 1,
        availableRooms: parsedData.data.totalRooms ?? 1, // Set initially to totalRooms
      }
    });

    revalidatePath("/partner/hotel");
    revalidatePath("/partner/homeStays");

    return { success: true, propertyId: property.id };
  } catch (error) {
    console.error("Error adding property:", error);
    return { success: false, error: "Failed to add property." };
  }
}

export async function updateProperty(propertyId: string, data: PropertyData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const parsedData = propertySchema.safeParse(data);
    if (!parsedData.success) return { success: false, error: "Invalid data provided." };

    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendorProfile) return { success: false, error: "Vendor profile not found." };

    // Verify ownership
    const existing = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!existing || existing.vendorProfileId !== vendorProfile.id) {
      return { success: false, error: "Property not found or access denied." };
    }

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name: parsedData.data.name,
        location: parsedData.data.location,
        description: parsedData.data.description,
        pricePerNight: parsedData.data.pricePerNight,
        images: parsedData.data.images || [],
        amenities: parsedData.data.amenities || [],
        totalRooms: parsedData.data.totalRooms ?? 1,
      }
    });

    revalidatePath("/partner/hotel");
    revalidatePath("/partner/homeStays");

    return { success: true, propertyId: property.id };
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, error: "Failed to update property." };
  }
}

export async function deleteProperty(propertyId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendorProfile) return { success: false, error: "Vendor profile not found." };

    // Verify ownership
    const existing = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!existing || existing.vendorProfileId !== vendorProfile.id) {
      return { success: false, error: "Property not found or access denied." };
    }

    await prisma.property.delete({ where: { id: propertyId } });

    revalidatePath("/partner/hotel");
    revalidatePath("/partner/homeStays");

    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, error: "Failed to delete property." };
  }
}

export async function addVehicle(data: VehicleData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const parsedData = vehicleSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "Invalid data provided." };
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: userId }
    });

    if (!vendorProfile) {
      return { success: false, error: "Vendor profile not found." };
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vendorProfileId: vendorProfile.id,
        make: parsedData.data.make,
        model: parsedData.data.model,
        registrationNum: parsedData.data.registrationNum,
        type: parsedData.data.type,
      }
    });

    revalidatePath("/partner/Taxi_Driver");

    return { success: true, vehicleId: vehicle.id };
  } catch (error) {
    console.error("Error adding vehicle:", error);
    return { success: false, error: "Failed to add vehicle." };
  }
}

export async function approveListing(id: string, type: 'PROPERTY' | 'VEHICLE') {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Only admins can approve listings" };
    }

    let itemName = "";
    let vendorEmail = "";
    let vendorName = "";

    if (type === 'PROPERTY') {
      const updated = await prisma.property.update({
        where: { id },
        data: { isApproved: true, status: "APPROVED", rejectionReason: null },
        include: { vendorProfile: { include: { user: true } } }
      });
      itemName = updated.name;
      vendorEmail = updated.vendorProfile.email || updated.vendorProfile.user?.email || "";
      vendorName = updated.vendorProfile.businessName;
    } else {
      const updated = await prisma.vehicle.update({
        where: { id },
        data: { isApproved: true, status: "APPROVED", rejectionReason: null },
        include: { vendorProfile: { include: { user: true } } }
      });
      itemName = `${updated.make} ${updated.model}`;
      vendorEmail = updated.vendorProfile.email || updated.vendorProfile.user?.email || "";
      vendorName = updated.vendorProfile.businessName;
    }

    if (vendorEmail) {
      try {
        await resend.emails.send({
          from: 'WanderKashmir <support@wanderkashmir.com>',
          to: vendorEmail,
          subject: `Listing Approved: ${itemName} 🎉`,
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0f172a;">Hi ${vendorName},</h2>
              <p>Great news! Your listing for <strong>${itemName}</strong> has been successfully <strong>approved</strong>.</p>
              <p>It is now live on WanderKashmir and visible to thousands of travelers.</p>
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;">🔗 <strong>View your Dashboard:</strong></p>
                <a href="https://wanderkashmir.com/partner" style="color: #0ea5e9; font-weight: bold; font-size: 16px; text-decoration: none;">wanderkashmir.com/partner</a>
              </div>
              <p>If you have any questions, feel free to contact us at support@wanderkashmir.com.</p>
              <p>Best Regards,<br/><strong>The WanderKashmir Team</strong></p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send listing approval email:", emailError);
      }
    }

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error approving listing:", error);
    return { success: false, error: "Failed to approve listing." };
  }
}

export async function rejectListing(id: string, type: 'PROPERTY' | 'VEHICLE', reason: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Only admins can reject listings" };
    }

    if (type === 'PROPERTY') {
      await prisma.property.update({
        where: { id },
        data: { isApproved: false, status: "REJECTED", rejectionReason: reason }
      });
    } else {
      await prisma.vehicle.update({
        where: { id },
        data: { isApproved: false, status: "REJECTED", rejectionReason: reason }
      });
    }

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting listing:", error);
    return { success: false, error: "Failed to reject listing." };
  }
}
