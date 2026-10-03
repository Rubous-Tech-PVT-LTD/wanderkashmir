/**
 * Server-side Email Service for WanderKashmir V2 Admin.
 * Uses Resend REST API natively via fetch, with automatic mock mode in development/staging.
 */

export interface EmailRecipient {
  email: string;
  businessName: string;
}

export interface SendBatchResult {
  success: boolean;
  count?: number;
  mocked?: boolean;
  error?: string;
  results?: any[];
}

export async function sendBulkEmails(
  recipients: EmailRecipient[],
  subject: string,
  contentTemplate: string,
  options?: {
    buttonText?: string;
    buttonUrl?: string;
    fromEmail?: string;
    fromName?: string;
  }
): Promise<SendBatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = `${options?.fromName || "WanderKashmir Updates"} <${options?.fromEmail || "updates@wanderkashmir.com"}>`;

  if (!apiKey) {
    console.log(`[MOCK EMAIL BROADCAST] Subject: "${subject}". Total recipients: ${recipients.length}`);
    return {
      success: true,
      count: recipients.length,
      mocked: true,
    };
  }

  try {
    const emailBatch = recipients.map((r) => {
      let personalizedHtml = contentTemplate.replace(/\[NAME\]/g, r.businessName);
      if (options?.buttonText) {
        personalizedHtml = personalizedHtml.replace(/\[BUTTON_TEXT\]/g, options.buttonText);
      }
      if (options?.buttonUrl) {
        personalizedHtml = personalizedHtml.replace(/\[BUTTON_URL\]/g, options.buttonUrl);
      }

      return {
        from,
        to: r.email,
        subject,
        html: personalizedHtml,
      };
    });

    const chunkSize = 100;
    const results: any[] = [];

    for (let i = 0; i < emailBatch.length; i += chunkSize) {
      const chunk = emailBatch.slice(i, i + chunkSize);

      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Resend batch send error at index ${i}:`, errorText);
        return {
          success: false,
          error: `Resend API error (${res.status}): ${errorText}`,
        };
      }

      const data = await res.json();
      results.push(data);
    }

    return {
      success: true,
      count: recipients.length,
      results,
    };
  } catch (err: any) {
    console.error("sendBulkEmails exception:", err);
    return {
      success: false,
      error: err.message || "Failed to communicate with email delivery provider.",
    };
  }
}
