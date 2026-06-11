"use server";

import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { getCurrentUserId } from "@/lib/auth";
import { ensureDbUser } from "@/lib/clerk-sync";
import { revalidatePath } from "next/cache";
import { VendorType } from "@prisma/client";
import { vendorRegistrationSchema, VendorRegistrationData } from "@/lib/validations";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function registerVendor(data: VendorRegistrationData) {
  try {
    // Validate the data on the server
    const parsedData = vendorRegistrationSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "Invalid data provided. Please check the fields." };
    }

    const validData = parsedData.data;

    // Check if user with this email exists
    let dbUser = await prisma.user.findUnique({
      where: { email: validData.email },
      include: { vendorProfile: true }
    });

    if (dbUser && dbUser.vendorProfile) {
      return { success: false, error: "This email is already registered as a vendor. Please log in instead." };
    }

    const bcrypt = require("bcrypt");
    const passwordHash = await bcrypt.hash(validData.password, 10);

    let userId = "";

    if (dbUser) {
      // User exists, update role and password
      const updateData: any = { password: passwordHash };
      if (dbUser.role !== "ADMIN") {
        updateData.role = "VENDOR";
      }
      await prisma.user.update({
        where: { id: dbUser.id },
        data: updateData
      });
      userId = dbUser.id;
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: validData.email,
          password: passwordHash,
          name: validData.businessName || "Vendor",
          role: "VENDOR"
        }
      });
      userId = newUser.id;
    }

    const typeString = validData.vendorType;
    let type: VendorType = "HOTEL";
    if (typeString === "hotel") type = "HOTEL";
    if (typeString === "homestay") type = "HOMESTAY";
    if (typeString === "taxi") type = "TAXI";
    if (typeString === "guide") type = "GUIDE";

    const vendorProfile = await prisma.vendorProfile.create({
      data: {
        userId: userId,
        businessName: validData.businessName,
        type: type,
        isApproved: false,
        subscriptionPlan: "FREE",
        kycDocuments: validData.kycDocuments || [],
        address: validData.address,
        email: validData.email,
        phone: validData.phone,
        altContactPerson: validData.altContactPerson,
        altPhone: validData.altPhone,
        accountHolderName: validData.accountHolderName,
        bankName: validData.bankName,
        accountNumber: validData.accountNumber,
        ifscCode: validData.ifscCode,
      }
    });

    revalidatePath("/wander-admin");
    revalidatePath("/partner");

    return { success: true, vendorId: vendorProfile.id };
  } catch (error: any) {
    console.error("Error registering vendor:", error);
    return { success: false, error: "Failed to register vendor: " + error.message };
  }
}

export async function approveVendor(vendorId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Only admins can approve vendors" };
    }
    // Generate a unique Vendor ID
    const generatedVendorId = `WK-${Math.floor(10000 + Math.random() * 90000)}`;

    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { 
        isApproved: true,
        status: "APPROVED",
        rejectionReason: null,
        vendorId: generatedVendorId
      },
      include: { user: true }
    });

    try {
      const client = await clerkClient();
      await client.users.updateUser(updatedVendor.userId, { username: generatedVendorId });

    } catch (clerkError) {
      console.error("Failed to update Clerk username:", clerkError);
      // We don't fail the approval if Clerk update fails, but ideally it should succeed
    }

    const vendorEmail = updatedVendor.email || updatedVendor.user?.email;
    const vendorName = updatedVendor.user?.name || updatedVendor.businessName || "Vendor";
    const contactFirstName = vendorName.split(" ")[0];

    if (vendorEmail) {
      try {
        await resend.emails.send({
          from: 'WanderKashmir <support@wanderkashmir.com>',
          to: vendorEmail,
          subject: `Welcome aboard, ${vendorName}!`,
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6;">
              <h2 style="color: #0f172a;">Hi ${contactFirstName},</h2>
              <p>Your vendor application has been approved. We're excited to start working with you. Below are the details of your account so you can begin setting up your profile and listings.</p>
              
              <h3 style="color: #0284c7; margin-top: 24px;">Your account details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Vendor ID:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0284c7;">${generatedVendorId}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Company:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${updatedVendor.businessName}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Account email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${vendorEmail}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Account manager:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">WanderKashmir</td></tr>
              </table>

              <h3 style="color: #0284c7;">Next steps</h3>
              <ul style="padding-left: 20px;">
                <li style="margin-bottom: 8px;">Log in to your vendor dashboard using your <strong>Vendor ID</strong> and complete your business profile.</li>
                <li style="margin-bottom: 8px;">Upload your tax and banking information for payouts.</li>
                <li style="margin-bottom: 8px;">Review our vendor policies and submit your first product or service listing.</li>
              </ul>

              <div style="margin: 32px 0;">
                <a href="https://wanderkashmir.com/partner" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to vendor dashboard</a>
              </div>

              <p>If you have any questions, reach out to your account manager at <a href="mailto:support@wanderkashmir.com">support@wanderkashmir.com</a> or visit our help center.</p>
              
              <br/>
              <p>Welcome to the team,<br/><strong>The WanderKashmir Vendor Team</strong></p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }
    }

    revalidatePath("/wander-admin");
    revalidatePath("/partner");

    return { success: true };
  } catch (error) {
    console.error("Error approving vendor:", error);
    return { success: false, error: "Failed to approve vendor." };
  }
}

export async function rejectVendor(vendorId: string, reason: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Only admins can reject vendors" };
    }
    await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { 
        isApproved: false,
        status: "REJECTED",
        rejectionReason: reason
      }
    });

    revalidatePath("/wander-admin");
    revalidatePath("/partner");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    return { success: false, error: "Failed to reject vendor." };
  }
}

export async function updateSubscriptionPlan(newPlan: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const planMap: Record<string, "FREE" | "GROWTH" | "PRO" | "ENTERPRISE"> = {
      "Free": "FREE",
      "Growth Pro": "GROWTH",
      "Pro": "PRO",
      "Enterprise": "ENTERPRISE"
    };

    const enumPlan = planMap[newPlan];
    if (!enumPlan) {
      return { success: false, error: "Invalid plan selected." };
    }

    await prisma.vendorProfile.update({
      where: { userId },
      data: { subscriptionPlan: enumPlan }
    });

    revalidatePath("/partner");
    return { success: true };
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return { success: false, error: "Failed to update subscription plan." };
  }
}
