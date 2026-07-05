"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { sendBulkEmailToVendors } from "@/lib/email";
import { VendorType, SubscriptionPlan } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function generateEmailWithAiAction(prompt: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Only admins can use AI tools" };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Gemini API Key is missing on the server. Please check the environmental configurations." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
    You are an expert copywriter for "WanderKashmir", a premium travel platform in Kashmir.
    Your task is to write a highly professional, beautifully styled marketing or updates email broadcast to send to our vendors (hotels, homestays, taxi operators, or tour guides).
    
    The email must be visually outstanding and follow the platform's warm orange brand aesthetics.
    Use inline styling for CSS.
    You MUST include the placeholder [NAME] (with square brackets) wherever appropriate to represent the vendor's business name (e.g. "Hi [NAME]").
    
    CRITICAL URL INSTRUCTIONS:
    1. NEVER use subdomains like "vendor.wanderkashmir.com" or paths like "/dashboard/listings" or similar in URLs/links.
    2. All vendor and partner routes are hosted on the main domain: "https://wanderkashmir.com"
    3. The main vendor portal link is: "https://wanderkashmir.com/partner"
    4. Link to specific dashboard sections if relevant:
       - Hotels: "https://wanderkashmir.com/partner/hotel"
       - Homestays: "https://wanderkashmir.com/partner/homeStays"
       - Taxis: "https://wanderkashmir.com/partner/Taxi_Driver"
       - Guides: "https://wanderkashmir.com/partner/Guide"
    
    The user wants an email about: "${prompt}"
    
    Return exactly a JSON object without markdown wrapping. Do NOT wrap the JSON in \`\`\`json ... \`\`\`.
    
    JSON STRUCTURE:
    {
      "subject": "Compelling subject line",
      "bodyHtml": "A complete, responsive HTML layout starting with container div (no html/body root tags), featuring premium orange colors, clean fonts (Segoe UI/Arial), card layout, CTA buttons, variables, and footer"
    }
    `;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return { success: true, data: parsedData };
  } catch (err: any) {
    console.error("generateEmailWithAiAction error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during generation." };
  }
}
