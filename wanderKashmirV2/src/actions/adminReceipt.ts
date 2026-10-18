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

import { SeasonId } from "@/lib/theme/seasonalThemes";
import { getSeasonFromDate } from "@/lib/theme/seasonUtils";

function resolveSeasonFromTravelDates(travelDates?: string | null): SeasonId {
  if (travelDates) {
    const s = travelDates.toLowerCase();
    if (s.includes("mar") || s.includes("apr") || s.includes("may") || s.includes("spring") || s.includes("sonth")) return "spring";
    if (s.includes("jun") || s.includes("jul") || s.includes("aug") || s.includes("summer") || s.includes("grishm")) return "summer";
    if (s.includes("sep") || s.includes("oct") || s.includes("nov") || s.includes("autumn") || s.includes("harud") || s.includes("fall")) return "autumn";
    if (s.includes("dec") || s.includes("jan") || s.includes("feb") || s.includes("winter") || s.includes("wandh")) return "winter";
  }
  return getSeasonFromDate(new Date());
}

const EMAIL_SEASON_STYLES: Record<
  SeasonId,
  {
    headerBg: string;
    badgeBg: string;
    subtextColor: string;
    sectionTitleColor: string;
    paymentBoxBg: string;
    paymentBoxBorder: string;
    payTotalColor: string;
    advanceColor: string;
    stampBg: string;
    stampBorder: string;
    stampText: string;
    footerLinkColor: string;
  }
> = {
  autumn: {
    headerBg: "#3b1111",
    badgeBg: "#b91c1c",
    subtextColor: "#fef3c7",
    sectionTitleColor: "#991b1b",
    paymentBoxBg: "#fffbeb",
    paymentBoxBorder: "#fde68a",
    payTotalColor: "#7f1d1d",
    advanceColor: "#c2410c",
    stampBg: "#fff7ed",
    stampBorder: "#fed7aa",
    stampText: "#c2410c",
    footerLinkColor: "#fbbf24",
  },
  spring: {
    headerBg: "#42122b",
    badgeBg: "#db2777",
    subtextColor: "#fce7f3",
    sectionTitleColor: "#9d174d",
    paymentBoxBg: "#fdf2f8",
    paymentBoxBorder: "#fbcfe8",
    payTotalColor: "#831843",
    advanceColor: "#be185d",
    stampBg: "#fdf2f8",
    stampBorder: "#fbcfe8",
    stampText: "#be185d",
    footerLinkColor: "#f472b6",
  },
  summer: {
    headerBg: "#064e3b",
    badgeBg: "#059669",
    subtextColor: "#d1fae5",
    sectionTitleColor: "#047857",
    paymentBoxBg: "#f0fdf4",
    paymentBoxBorder: "#bbf7d0",
    payTotalColor: "#064e3b",
    advanceColor: "#059669",
    stampBg: "#ecfdf5",
    stampBorder: "#a7f3d0",
    stampText: "#059669",
    footerLinkColor: "#34d399",
  },
  winter: {
    headerBg: "#0f2d47",
    badgeBg: "#0284c7",
    subtextColor: "#e0f2fe",
    sectionTitleColor: "#0369a1",
    paymentBoxBg: "#f0f9ff",
    paymentBoxBorder: "#bae6fd",
    payTotalColor: "#0c4a6e",
    advanceColor: "#0284c7",
    stampBg: "#f0f9ff",
    stampBorder: "#bae6fd",
    stampText: "#0284c7",
    footerLinkColor: "#38bdf8",
  },
};

export interface SendReceiptEmailInput {
  leadId: string;
  customerEmail: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentMethod?: string;
  season?: string;
  instructions?: string;
  termsPkg?: string;
  termsAdv?: string;
  termsBal?: string;
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

    const validSeasons: SeasonId[] = ["spring", "summer", "autumn", "winter"];
    const seasonKey: SeasonId = input.season && validSeasons.includes(input.season as SeasonId)
      ? (input.season as SeasonId)
      : resolveSeasonFromTravelDates(lead.travelDates);

    const sStyle = EMAIL_SEASON_STYLES[seasonKey] || EMAIL_SEASON_STYLES.autumn;

    // Parse instructions for email if provided or from adminNotes
    let savedInstructions = "";
    if (lead.adminNotes) {
      const matchInst = lead.adminNotes.match(/\[INSTRUCTIONS:([\s\S]*?)\]/i);
      if (matchInst) savedInstructions = matchInst[1].trim();
    }
    const rawInstructions = input.instructions !== undefined
      ? input.instructions
      : savedInstructions;

    const instructionsHtml = (() => {
      if (!rawInstructions || ["none", "n/a", "no", "hide", "blank"].includes(rawInstructions.toLowerCase().trim())) {
        return "";
      }
      const lines = rawInstructions.split(/[\n|]/).map(l => l.replace(/^[•\s*-]+/, "").trim()).filter(Boolean);
      if (lines.length === 0) return "";
      return `
        <div style="margin-top: 24px; font-size: 12px; color: #64748b; line-height: 1.6;">
          <strong>Important Ground Instructions:</strong><br>
          ${lines.map(l => `• ${l.replace("{balance}", `₹${input.balanceAmount.toLocaleString("en-IN")}`)}`).join("<br>\n          ")}
        </div>
      `;
    })();

    const termsPkgText = input.termsPkg || "Inclusive of stays, private transport & assistance";
    const termsAdvText = input.termsAdv || "Booking locked & vehicle/hotel reserved";
    const termsBalText = input.termsBal || "Payable at Srinagar arrival (cash or UPI to driver/hotel)";

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
          .header { background: ${sStyle.headerBg}; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
          .header p { margin: 0; font-size: 13px; color: ${sStyle.subtextColor}; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .badge-row { text-align: center; margin-top: -16px; }
          .badge { display: inline-block; background: ${sStyle.badgeBg}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #ffffff; }
          .content { padding: 32px 24px; }
          .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${sStyle.sectionTitleColor}; margin-bottom: 12px; }
          .card { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9; margin-bottom: 24px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
          .row:last-child { border-bottom: none; }
          .label { color: #64748b; font-weight: 500; }
          .val { color: #0f172a; font-weight: 600; text-align: right; }
          .payment-box { background: ${sStyle.paymentBoxBg}; border: 1.5px solid ${sStyle.paymentBoxBorder}; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
          .pay-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .pay-total { font-size: 16px; font-weight: 800; color: ${sStyle.payTotalColor}; border-bottom: 1px solid ${sStyle.paymentBoxBorder}; padding-bottom: 8px; margin-bottom: 8px; }
          .pay-advance { color: ${sStyle.advanceColor}; font-weight: 700; }
          .pay-balance { color: #b45309; font-weight: 800; font-size: 15px; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 6px; }
          .footer { background: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; }
          .footer a { color: ${sStyle.footerLinkColor}; text-decoration: none; font-weight: 600; }
          .stamp { text-align: center; font-size: 11px; color: ${sStyle.stampText}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; padding: 8px; background: ${sStyle.stampBg}; border-radius: 8px; border: 1px solid ${sStyle.stampBorder}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <p>Official Travel Voucher & Receipt</p>
            <h1>WanderKashmir</h1>
            <div style="font-size: 12px; color: ${sStyle.subtextColor}; margin-top: 4px;">Srinagar, Jammu & Kashmir • Direct Local Operations</div>
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
                <div>
                  <span style="display:block;">Total Package Cost:</span>
                  <span style="font-size:11px; font-weight:normal; opacity:0.8;">${termsPkgText}</span>
                </div>
                <span>₹${input.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div class="pay-row pay-advance">
                <div>
                  <span style="display:block;">Advance Deposit Paid (Confirmed):</span>
                  <span style="font-size:11px; font-weight:normal; opacity:0.8;">${termsAdvText}</span>
                </div>
                <span>₹${input.advanceAmount.toLocaleString("en-IN")} (PAID)</span>
              </div>
              <div class="pay-row pay-balance">
                <div>
                  <span style="display:block;">Balance Due on Arrival:</span>
                  <span style="font-size:11px; font-weight:normal; opacity:0.8;">${termsBalText}</span>
                </div>
                <span>₹${input.balanceAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div class="stamp">
              ✓ Verified Local Srinagar Booking • 24/7 Ground Assistance Included
            </div>

            ${instructionsHtml}
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
