"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendCrmLeadEmail } from "@/lib/email";

export async function generateCrmEmailWithAiAction(
  leadId: string,
  templatePrompt: string,
  customPrompt: string
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized", status: 401 };
    }

    const lead = await prisma.crmLead.findUnique({
      where: { id: leadId },
      include: {
        callLogs: {
          orderBy: { createdAt: "desc" },
          take: 3,
        }
      }
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    const baUser = await prisma.crmUser.findUnique({
      where: { id: session.userId }
    });
    
    let baWaLink = "https://wa.me/919906660126"; // Default WanderKashmir number
    if (baUser?.phone) {
      const cleanPhone = baUser.phone.replace(/[^0-9]/g, "");
      if (cleanPhone) {
        baWaLink = `https://wa.me/${cleanPhone}`;
      }
    }

    if (session.role === "BUSINESS_ASSOCIATE" && lead.assignedBaId !== session.userId) {
      return { success: false, error: "Forbidden: You do not have access to this lead", status: 403 };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Gemini API Key is missing on the server." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Format lead context
    const leadContext = `
      Company Name: ${lead.companyName}
      Contact Person: ${lead.contactPerson || "Not provided"}
      City/State: ${lead.city || ""}, ${lead.state || ""}
      Phone: ${lead.phone}
      Email: ${lead.email || "Not provided"}
      Website: ${lead.website || "Not provided"}
      Source: ${lead.source || "Not provided"}
      Interested Status: ${lead.interestLevel || "Not provided"}
      Notes: ${lead.notes || "None"}
      
      Recent Activity History:
      ${lead.callLogs.map(log => `- [${new Date(log.createdAt).toISOString().split('T')[0]}] ${log.outcome}: ${log.notes}`).join('\n') || "No previous interaction history."}
    `;

    const systemPrompt = `
    You are an expert B2B copywriter for "WanderKashmir", a premium travel platform and DMC in Kashmir.
    Your task is to write a highly professional, beautifully styled email to send to this travel agency lead.
    
    The email must follow the platform's warm orange brand aesthetics.
    Use inline styling for CSS.
    
    CRITICAL: Any Call-to-Action (CTA) buttons or links you generate (e.g. "Connect with Us", "Chat on WhatsApp") MUST strictly use the following WhatsApp link for the href attribute: ${baWaLink}
    DO NOT use "#" or dummy links.
    
    LEAD CONTEXT (Do not invent facts outside of this context):
    ${leadContext}
    
    INSTRUCTIONS / TEMPLATE:
    ${templatePrompt}
    
    ADDITIONAL CUSTOM INSTRUCTION FROM AGENT:
    ${customPrompt || "None"}

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
    console.error("generateCrmEmailWithAiAction error:", err);
    return { success: false, error: "Unable to generate draft. Please try again." };
  }
}

export async function sendCrmEmailAction(
  leadId: string,
  subject: string,
  bodyHtml: string
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized", status: 401 };
    }

    const lead = await prisma.crmLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    if (session.role === "BUSINESS_ASSOCIATE" && lead.assignedBaId !== session.userId) {
      return { success: false, error: "Forbidden: You do not have access to this lead", status: 403 };
    }

    if (!lead.email) {
      return { success: false, error: "Lead does not have an email address." };
    }

    // Call Resend
    const res = await sendCrmLeadEmail(lead.email, subject, bodyHtml);

    if (res.success) {
      // Create CrmAuditLog
      await prisma.crmAuditLog.create({
        data: {
          userId: session.userId,
          userRole: session.role,
          action: "SEND_EMAIL",
          entity: "CrmLead",
          entityId: leadId,
          newValue: {
            recipient: lead.email,
            subject: subject,
            resendId: res.data?.id || "mocked",
            status: "sent"
          },
        }
      });
      return { success: true };
    } else {
      return { success: false, error: "Failed to send email via Resend." };
    }
  } catch (err: any) {
    console.error("sendCrmEmailAction error:", err);
    return { success: false, error: "An unexpected error occurred while sending." };
  }
}
