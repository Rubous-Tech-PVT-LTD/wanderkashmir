"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

interface MutationResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

async function verifyAdminAuth() {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { authorized: false, error: "Unauthorized: Admin session required." };
  }
  return { authorized: true, adminId: session.userId };
}

export interface SavePaymentInput {
  leadId: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentStatus: "ADVANCE_PAID" | "PENDING_ARRIVAL" | "FULLY_PAID";
  leadStatus?: string;
  adminNotes?: string;
}

/**
 * Save financial breakdown (Total, Advance, Balance Due on Arrival) into the lead record
 */
export async function saveLeadPaymentAction(input: SavePaymentInput): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const { leadId, totalAmount, advanceAmount, balanceAmount, paymentStatus, leadStatus, adminNotes } = input;

    const lead = await prisma.customTourRequest.findUnique({
      where: { id: leadId },
      select: { specialRequests: true, adminNotes: true },
    });

    if (!lead) {
      return { success: false, error: "Lead not found." };
    }

    const paymentTag = `[PAYMENT: Total=₹${totalAmount} | Advance=₹${advanceAmount} | Balance=₹${balanceAmount} | Status=${paymentStatus}]`;

    // Strip previous payment tags and append fresh one
    const cleanNotes = (adminNotes || lead.adminNotes || "").replace(/\[PAYMENT:[^\]]+\]/g, "").trim();
    const finalAdminNotes = [cleanNotes, paymentTag].filter(Boolean).join(" | ");

    await prisma.customTourRequest.update({
      where: { id: leadId },
      data: {
        status: leadStatus || "CONFIRMED",
        adminNotes: finalAdminNotes,
      },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error saving lead payment:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save payment details.",
    };
  }
}

export interface SendReceiptEmailInput {
  leadId: string;
  customerEmail: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentMethod?: string;
}

/**
 * Send branded, luxury HTML booking confirmation and payment receipt email via Resend
 */
export async function sendLeadReceiptEmailAction(input: SendReceiptEmailInput): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const lead = await prisma.customTourRequest.findUnique({
      where: { id: input.leadId },
    });

    if (!lead) {
      return { success: false, error: "Lead not found." };
    }

    const targetEmail = input.customerEmail?.trim() || lead.email?.trim();
    if (!targetEmail) {
      return { success: false, error: "Customer email address is required to send receipt." };
    }

    const refId = `WK-${lead.id.slice(-6).toUpperCase()}`;
    const destinationsText = Array.isArray(lead.destinations) && lead.destinations.length > 0
      ? lead.destinations.join(" • ")
      : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation & Payment Voucher - WanderKashmir</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ecfdf5; }
          .header p { margin: 0; font-size: 13px; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .badge-row { text-align: center; margin-top: -16px; }
          .badge { display: inline-block; background: #059669; color: #ffffff; font-size: 11px; font-weight: 700; padding: 6px 14px; rounded-full; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #ffffff; }
          .content { padding: 32px 24px; }
          .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #047857; margin-bottom: 12px; }
          .card { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9; margin-bottom: 24px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
          .row:last-child { border-bottom: none; }
          .label { color: #64748b; font-weight: 500; }
          .val { color: #0f172a; font-weight: 600; text-align: right; }
          .payment-box { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
          .pay-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .pay-total { font-size: 16px; font-weight: 800; color: #064e3b; border-bottom: 1px solid #bbf7d0; padding-bottom: 8px; margin-bottom: 8px; }
          .pay-advance { color: #059669; font-weight: 700; }
          .pay-balance { color: #b45309; font-weight: 800; font-size: 15px; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 6px; }
          .footer { background: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; }
          .footer a { color: #34d399; text-decoration: none; font-weight: 600; }
          .stamp { text-align: center; font-size: 11px; color: #059669; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; padding: 8px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <p>Official Travel Voucher & Receipt</p>
            <h1>WanderKashmir</h1>
            <div style="font-size: 12px; color: #d1fae5; margin-top: 4px;">Srinagar, Jammu & Kashmir • Direct Local Operations</div>
          </div>
          
          <div class="badge-row">
            <span class="badge">Booking Confirmed</span>
          </div>

          <div class="content">
            <p style="font-size: 15px; line-height: 1.5; margin-top: 0;">
              Dear <strong>${lead.name}</strong>,<br>
              Thank you for choosing <strong>WanderKashmir</strong> for your upcoming Kashmir holiday. We have received your advance payment and your tour booking is officially confirmed.
            </p>

            <div class="section-title">Trip & Traveler Summary</div>
            <div class="card">
              <div class="row"><span class="label">Booking Ref ID</span><span class="val" style="font-family: monospace; color: #047857; font-weight: 800;">${refId}</span></div>
              <div class="row"><span class="label">Lead Guest</span><span class="val">${lead.name}</span></div>
              <div class="row"><span class="label">Contact Phone</span><span class="val">${lead.phone}</span></div>
              <div class="row"><span class="label">Travel Dates / Duration</span><span class="val">${lead.travelDates || "Upcoming"}</span></div>
              <div class="row"><span class="label">Guests</span><span class="val">${lead.guestsCount}</span></div>
              ${destinationsText ? `<div class="row"><span class="label">Route Plan</span><span class="val">${destinationsText}</span></div>` : ""}
              <div class="row"><span class="label">Stay Category</span><span class="val">${lead.hotelType}</span></div>
              <div class="row"><span class="label">Private Vehicle</span><span class="val">${lead.cabType}</span></div>
            </div>

            <div class="section-title">Payment & Advance Receipt</div>
            <div class="payment-box">
              <div class="pay-row pay-total">
                <span>Total Package Cost:</span>
                <span>₹${input.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div class="pay-row pay-advance">
                <span>Advance Deposit Paid (Confirmed):</span>
                <span>₹${input.advanceAmount.toLocaleString("en-IN")} (PAID)</span>
              </div>
              <div class="pay-row pay-balance">
                <span>Balance Due on Arrival:</span>
                <span>₹${input.balanceAmount.toLocaleString("en-IN")} (Payable at Srinagar)</span>
              </div>
            </div>

            <div class="stamp">
              ✓ Verified Local Srinagar Booking • 24/7 Ground Assistance Included
            </div>

            <div style="margin-top: 24px; font-size: 12px; color: #64748b; line-height: 1.6;">
              <strong>Important Notes:</strong><br>
              • Driver and cab details with contact number will be shared 24 hours prior to arrival.<br>
              • The balance amount of ₹${input.balanceAmount.toLocaleString("en-IN")} is payable at Srinagar upon check-in / driver arrival.<br>
              • For any assistance or changes, connect directly with our Srinagar operations helpline.
            </div>
          </div>

          <div class="footer">
            <strong>WanderKashmir Local Operations</strong><br>
            Srinagar, Jammu & Kashmir, India<br>
            Helpline: <a href="tel:+916005888754">+91 60058 88754</a> • WhatsApp: <a href="https://wa.me/916005888754">+91 60058 88754</a><br>
            Email: <a href="mailto:support@wanderkashmir.com">support@wanderkashmir.com</a> • Web: <a href="https://www.wanderkashmir.com">wanderkashmir.com</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`[MOCK EMAIL RECEIPT] Would send luxury receipt to ${targetEmail} for Ref ${refId}`);
      return { success: true };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "WanderKashmir Bookings <bookings@wanderkashmir.com>",
        to: targetEmail,
        subject: `Booking Confirmation & Payment Voucher: ${refId} - WanderKashmir`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.message || `Failed to send email (Status: ${res.status})`,
      };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Error sending receipt email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send receipt email.",
    };
  }
}
