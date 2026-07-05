"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { sendBulkEmailToVendors } from "@/lib/email";
import { VendorType, SubscriptionPlan } from "@prisma/client";

interface SendBulkEmailInput {
  subject: string;
  bodyHtml: string;
  vendorType: string; // "ALL", "HOTEL", "HOMESTAY", "TAXI", "GUIDE"
  subscriptionPlan: string; // "ALL", "FREE", "GROWTH", "PRO", "ENTERPRISE"
  testEmail?: string;
}

export async function sendBulkEmailsAction(input: SendBulkEmailInput) {
  try {
    // 1. Authorize Admin
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Only admins can send bulk emails" };
    }

    const { subject, bodyHtml, vendorType, subscriptionPlan, testEmail } = input;

    if (!subject.trim()) {
      return { success: false, error: "Subject is required" };
    }
    if (!bodyHtml.trim()) {
      return { success: false, error: "Body is required" };
    }

    // 2. If test email, send to the specified email address
    if (testEmail && testEmail.trim()) {
      const res = await sendBulkEmailToVendors(
        [{ email: testEmail, businessName: "Test Business" }],
        `[TEST] ${subject}`,
        bodyHtml
      );
      if (res.success) {
        return { success: true, count: 1, test: true };
      }
      return { success: false, error: "Failed to send test email" };
    }

    // 3. Prepare filters for DB Query
    const whereClause: any = {
      isApproved: true,
      status: "APPROVED",
      email: { not: null },
    };

    if (vendorType !== "ALL") {
      whereClause.type = vendorType as VendorType;
    }

    if (subscriptionPlan !== "ALL") {
      whereClause.subscriptionPlan = subscriptionPlan as SubscriptionPlan;
    }

    // 4. Fetch Targeted Vendors
    const vendors = await prisma.vendorProfile.findMany({
      where: whereClause,
      select: {
        email: true,
        businessName: true,
      },
    });

    if (vendors.length === 0) {
      return { success: false, error: "No matching vendors found with the selected filters." };
    }

    const validRecipients = vendors.filter(v => v.email && v.email.includes("@")) as { email: string; businessName: string }[];

    if (validRecipients.length === 0) {
      return { success: false, error: "No valid email addresses found." };
    }

    // 5. Send Bulk Emails
    const res = await sendBulkEmailToVendors(validRecipients, subject, bodyHtml);

    if (res.success) {
      return { success: true, count: validRecipients.length, test: false };
    }

    return { success: false, error: "Failed to send bulk emails." };

  } catch (err: any) {
    console.error("sendBulkEmailsAction error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}
