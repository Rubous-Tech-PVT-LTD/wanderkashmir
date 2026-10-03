"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { sendBulkEmails, EmailRecipient } from "@/lib/admin/email";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function verifyAdminAuth() {
  const session = await getAdminSession();
  if (!session || !session.userId) {
    return { ok: false, error: "Unauthorized: Admin session required." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { ok: false, error: "Forbidden: Administrator privileges required." };
  }

  return { ok: true, user: dbUser };
}

export interface AudienceCountParams {
  audienceType: string; // "ALL", "HOTEL", "HOMESTAY", "TAXI", "GUIDE", "TOURISTS", "CSV"
  subscriptionPlan?: string; // "ALL", "FREE", "GROWTH", "PRO", "ENTERPRISE"
  csvCount?: number;
}

/**
 * Calculates live recipient counts directly from the production database without sending.
 */
export async function getAudienceCountAction(
  params: AudienceCountParams
): Promise<ActionResult<{ count: number; description: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const { audienceType, subscriptionPlan = "ALL", csvCount = 0 } = params;

    if (audienceType === "CSV") {
      return {
        success: true,
        data: {
          count: csvCount,
          description: `${csvCount} recipients parsed from custom CSV upload`,
        },
      };
    }

    if (audienceType === "TOURISTS") {
      const count = await prisma.user.count({
        where: {
          role: "CUSTOMER",
          isBanned: false,
          email: { not: "" },
        },
      });
      return {
        success: true,
        data: {
          count,
          description: `${count} registered tourists and traveler accounts`,
        },
      };
    }

    // Vendor query
    const where: any = {
      isApproved: true,
      status: "APPROVED",
      email: { not: null },
    };

    if (audienceType !== "ALL") {
      where.type = audienceType;
    }

    if (subscriptionPlan !== "ALL") {
      where.subscriptionPlan = subscriptionPlan;
    }

    const count = await prisma.vendorProfile.count({ where });

    const planLabel = subscriptionPlan === "ALL" ? "all plans" : `${subscriptionPlan} plan`;
    const typeLabel = audienceType === "ALL" ? "all verified partner vendors" : `${audienceType} vendors`;

    return {
      success: true,
      data: {
        count,
        description: `${count} active ${typeLabel} on ${planLabel}`,
      },
    };
  } catch (err: any) {
    console.error("getAudienceCountAction error:", err);
    return { success: false, error: err.message || "Failed to calculate audience count." };
  }
}

export interface SendBulkEmailInput {
  subject: string;
  bodyHtml: string;
  audienceType: string;
  subscriptionPlan?: string;
  buttonText?: string;
  buttonUrl?: string;
  isTest?: boolean;
  testEmail?: string;
  customRecipients?: EmailRecipient[];
}

/**
 * Executes a controlled bulk email send with server-side validation and sanitization.
 */
export async function sendBulkEmailAction(
  input: SendBulkEmailInput
): Promise<ActionResult<{ count: number; isTest: boolean; mocked?: boolean }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const {
      subject,
      bodyHtml,
      audienceType,
      subscriptionPlan = "ALL",
      buttonText,
      buttonUrl,
      isTest,
      testEmail,
      customRecipients,
    } = input;

    if (!subject.trim()) {
      return { success: false, error: "Email subject line is required." };
    }
    if (!bodyHtml.trim()) {
      return { success: false, error: "Email HTML body is required." };
    }

    // 1. Test Email Dispatch
    if (isTest) {
      if (!testEmail || !testEmail.includes("@")) {
        return { success: false, error: "A valid test destination email is required." };
      }

      const res = await sendBulkEmails(
        [{ email: testEmail.trim().toLowerCase(), businessName: "Test Partner" }],
        `[TEST] ${subject}`,
        bodyHtml,
        { buttonText, buttonUrl }
      );

      if (res.success) {
        return {
          success: true,
          data: { count: 1, isTest: true, mocked: res.mocked },
        };
      }
      return { success: false, error: res.error || "Failed to deliver test email." };
    }

    // 2. Production Audience Query
    let rawRecipients: EmailRecipient[] = [];

    if (audienceType === "CSV") {
      if (!customRecipients || customRecipients.length === 0) {
        return { success: false, error: "CSV recipients list is empty." };
      }
      rawRecipients = customRecipients;
    } else if (audienceType === "TOURISTS") {
      const users = await prisma.user.findMany({
        where: { role: "CUSTOMER", isBanned: false, email: { not: "" } },
        select: { email: true, name: true },
      });
      rawRecipients = users.map((u) => ({
        email: u.email,
        businessName: u.name || "Traveler",
      }));
    } else {
      const where: any = {
        isApproved: true,
        status: "APPROVED",
        email: { not: null },
      };

      if (audienceType !== "ALL") {
        where.type = audienceType;
      }
      if (subscriptionPlan !== "ALL") {
        where.subscriptionPlan = subscriptionPlan;
      }

      const vendors = await prisma.vendorProfile.findMany({
        where,
        select: { email: true, businessName: true },
      });

      rawRecipients = vendors
        .filter((v) => v.email && v.email.includes("@"))
        .map((v) => ({
          email: v.email!,
          businessName: v.businessName || "Valued Partner",
        }));
    }

    // 3. Clean and sanitize email addresses to prevent provider rejections
    const cleanedRecipients: EmailRecipient[] = rawRecipients
      .map((r) => ({
        email: r.email.replace(/[^\x20-\x7E]/g, "").replace(/["'\s]/g, "").trim().toLowerCase(),
        businessName: r.businessName.trim() || "Valued Partner",
      }))
      .filter((r) => r.email.includes("@") && r.email.includes("."));

    if (cleanedRecipients.length === 0) {
      return { success: false, error: "No valid recipient email addresses found for the selected audience." };
    }

    // 4. Send Broadcast
    const sendRes = await sendBulkEmails(cleanedRecipients, subject, bodyHtml, {
      buttonText,
      buttonUrl,
    });

    if (sendRes.success) {
      return {
        success: true,
        data: {
          count: cleanedRecipients.length,
          isTest: false,
          mocked: sendRes.mocked,
        },
      };
    }

    return { success: false, error: sendRes.error || "Failed to dispatch bulk email broadcast." };
  } catch (err: any) {
    console.error("sendBulkEmailAction error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during bulk email send." };
  }
}

/**
 * AI-assisted marketing email draft generator using Gemini or pre-designed templates.
 */
export async function generateEmailDraftWithAiAction(
  prompt: string
): Promise<ActionResult<{ subject: string; bodyHtml: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    if (!prompt.trim()) {
      return { success: false, error: "Prompt description is required." };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemInstruction = `You are an expert travel copywriter for WanderKashmir. Generate an email broadcast formatted as JSON: { "subject": string, "bodyHtml": string }. Use warm orange aesthetics (#f97316), clean modern card layout (max-width 600px, inline CSS). Must include placeholders [NAME], [BUTTON_URL], and [BUTTON_TEXT]. Output ONLY raw JSON without markdown backticks.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemInstruction}\n\nTopic: ${prompt}` }],
                },
              ],
            }),
          }
        );

        if (res.ok) {
          const apiData = await res.json();
          const text = apiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.subject && parsed.bodyHtml) {
            return { success: true, data: parsed };
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini generation failed, falling back to template:", geminiErr);
      }
    }

    // High quality fallback template
    return {
      success: true,
      data: {
        subject: `Important Update for WanderKashmir Partners: ${prompt.slice(0, 40)}`,
        bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 800;">WanderKashmir Announcement</h1>
  </div>
  <div style="padding: 32px; background: #ffffff;">
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>[NAME]</strong>,</p>
    <p>We are writing to share an essential platform announcement regarding: <em>${prompt}</em>.</p>
    <div style="background: #f8fafc; border-left: 4px solid #f97316; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-weight: 600; color: #1e293b;">Important Details:</p>
      <p style="margin: 4px 0 0;">Please review your dashboard and update any relevant dates, rates, or listing media to maximize your seasonal visibility.</p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="[BUTTON_URL]" style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">[BUTTON_TEXT]</a>
    </div>
    <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Warm regards,<br/><strong>WanderKashmir Team</strong></p>
  </div>
</div>`,
      },
    };
  } catch (err: any) {
    console.error("generateEmailDraftWithAiAction error:", err);
    return { success: false, error: err.message || "Failed to generate email draft." };
  }
}
