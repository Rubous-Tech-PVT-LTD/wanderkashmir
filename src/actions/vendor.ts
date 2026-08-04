"use server";

import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { getCurrentUserId, getVendorSession } from "@/lib/auth";
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

    let dbUser = await prisma.user.findUnique({
      where: { email: validData.email },
      include: { vendorProfiles: true }
    });

    if (dbUser && dbUser.vendorProfiles && dbUser.vendorProfiles.length > 0) {
      // Allow registering another profile, just check if they are trying to register exactly the same type
      const hasSameType = dbUser.vendorProfiles.some(p => p.type === validData.vendorType.toUpperCase() as VendorType);
      if (hasSameType) {
        return { success: false, error: `You already have a registered ${validData.vendorType} profile with this email.` };
      }
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
        latitude: validData.latitude,
        longitude: validData.longitude,
        email: validData.email,
        phone: validData.phone,
        altContactPerson: validData.altContactPerson,
        altPhone: validData.altPhone,
        accountHolderName: validData.accountHolderName,
        bankName: validData.bankName,
        accountNumber: validData.accountNumber,
        ifscCode: validData.ifscCode,
        
        gstNumber: validData.gstNumber,
        panNumber: validData.panNumber,
        tradeLicense: validData.tradeLicense,
        
        taxiRole: validData.taxiRole,
        drivingLicense: validData.drivingLicense,
        vehicleRegistration: validData.vehicleRegistration,
        vehicleType: validData.vehicleType,
        guideLicense: validData.guideLicense,
        languages: validData.languages,
        experienceYears: validData.experienceYears ? parseInt(validData.experienceYears, 10) : null,
      }
    });

    revalidatePath("/wander-admin");
    revalidatePath("/partner");

    // Send "Application Received" confirmation email to vendor
    try {
      const vendorName = validData.businessName || "Vendor";
      const firstName = vendorName.split(" ")[0];
      const typeLabel = type === "HOTEL" ? "Hotel" : type === "HOMESTAY" ? "Homestay" : type === "TAXI" ? "Taxi" : "Guide";

      await resend.emails.send({
        from: 'Indiahiles <support@indiahiles.com>',
        to: validData.email,
        subject: `Application Received – Indiahiles Partner Program`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; background: #f8fafc; padding: 40px 20px; min-height: 100vh;">
            <div style="max-width: 580px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px; text-align: center;">
                <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                  <span style="font-size: 20px; font-weight: 900; color: white; letter-spacing: -0.5px;">Wander<span style="color: #f97316;">Kashmir</span></span>
                </div>
                <div style="width: 72px; height: 72px; background: rgba(249,115,22,0.15); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 36px;">📋</span>
                </div>
                <h1 style="color: white; font-size: 24px; font-weight: 800; margin: 0 0 8px;">Application Received!</h1>
                <p style="color: #94a3b8; font-size: 15px; margin: 0;">Your ${typeLabel} partner application is under review</p>
              </div>

              <!-- Body -->
              <div style="padding: 40px;">
                <p style="color: #334155; font-size: 16px; margin: 0 0 24px;">Hi <strong>${firstName}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
                  Thank you for registering as a <strong>${typeLabel}</strong> partner on Indiahiles. We have received your details and documents.
                </p>
                
                <!-- Status Card -->
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">⏳</span>
                    <div>
                      <p style="font-weight: 800; color: #166534; margin: 0; font-size: 16px;">Under Evaluation</p>
                      <p style="color: #15803d; margin: 0; font-size: 13px;">Estimated: 24–48 hours</p>
                    </div>
                  </div>
                  <p style="color: #166534; font-size: 14px; margin: 0; line-height: 1.6;">
                    Our team is reviewing your documents. Once approved, you will receive a separate confirmation email with your Vendor ID and dashboard access.
                  </p>
                </div>

                <!-- What's Next -->
                <div style="margin-bottom: 28px;">
                  <p style="font-weight: 700; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">What happens next?</p>
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 28px; height: 28px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #1d4ed8; flex-shrink: 0;">1</div>
                      <p style="color: #475569; font-size: 14px; margin: 0;">Our team reviews your submitted documents</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 28px; height: 28px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #1d4ed8; flex-shrink: 0;">2</div>
                      <p style="color: #475569; font-size: 14px; margin: 0;">You receive an approval confirmation email</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 28px; height: 28px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #1d4ed8; flex-shrink: 0;">3</div>
                      <p style="color: #475569; font-size: 14px; margin: 0;">Log in and publish your first listing!</p>
                    </div>
                  </div>
                </div>

                <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
                  <p style="color: #713f12; font-size: 13px; margin: 0; line-height: 1.6;">
                    📧 <strong>Registered Email:</strong> ${validData.email}<br/>
                    🏢 <strong>Business Name:</strong> ${validData.businessName}<br/>
                    🔑 <strong>Service Type:</strong> ${typeLabel}
                  </p>
                </div>

                <p style="color: #64748b; font-size: 13px; line-height: 1.7; margin: 0;">
                  If you have any questions, feel free to reply to this email or contact us at 
                  <a href="mailto:support@indiahiles.com" style="color: #f97316; font-weight: 600;">support@indiahiles.com</a>.
                </p>
              </div>

              <!-- Footer -->
              <div style="padding: 24px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 Indiahiles. All rights reserved.</p>
              </div>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Failed to send registration confirmation email:", emailError);
      // Don't fail registration if email fails
    }

    return { success: true, vendorId: vendorProfile.id };
  } catch (error: any) {
    console.error("Error registering vendor:", error);
    // Show a professional error message instead of raw database errors
    return { success: false, error: "Registration failed. An unexpected error occurred while setting up your account. Please try again or contact support." };
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
          from: 'Indiahiles <support@indiahiles.com>',
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
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Account manager:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">Indiahiles</td></tr>
              </table>

              <h3 style="color: #0284c7;">Next steps</h3>
              <ul style="padding-left: 20px;">
                <li style="margin-bottom: 8px;">Log in to your vendor dashboard using your <strong>Vendor ID</strong> and complete your business profile.</li>
                <li style="margin-bottom: 8px;">Upload your tax and banking information for payouts.</li>
                <li style="margin-bottom: 8px;">Review our vendor policies and submit your first product or service listing.</li>
              </ul>

              <div style="margin: 32px 0;">
                <a href="https://indiahiles.com/partner" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to vendor dashboard</a>
              </div>

              <p>If you have any questions, reach out to your account manager at <a href="mailto:support@indiahiles.com">support@indiahiles.com</a> or visit our help center.</p>
              
              <br/>
              <p>Welcome to the team,<br/><strong>The Indiahiles Vendor Team</strong></p>
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

    const session = await getVendorSession();
    if (session?.vendorProfileId) {
      await prisma.vendorProfile.update({
        where: { id: session.vendorProfileId },
        data: { subscriptionPlan: enumPlan }
      });
    } else {
      // Fallback update first profile if no specific profile selected
      const firstProfile = await prisma.vendorProfile.findFirst({ where: { userId } });
      if (firstProfile) {
        await prisma.vendorProfile.update({
          where: { id: firstProfile.id },
          data: { subscriptionPlan: enumPlan }
        });
      }
    }

    revalidatePath("/partner");
    return { success: true };
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return { success: false, error: "Failed to update subscription plan." };
  }
}
