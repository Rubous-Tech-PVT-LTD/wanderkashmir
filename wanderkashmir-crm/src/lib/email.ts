import { Resend } from 'resend';

// Only initialize if the key is present to prevent crashes in dev
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendCrmLeadEmail(
  toEmail: string,
  subject: string,
  bodyHtml: string,
  attachments?: { filename: string, content: Buffer }[]
) {
  if (!resend) {
    console.log(`[MOCK CRM EMAIL] Subject: "${subject}". Recipient: ${toEmail}`);
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'WanderKashmir Updates <updates@wanderkashmir.com>', // MUST BE A VERIFIED DOMAIN IN RESEND
      to: toEmail,
      subject: subject,
      html: bodyHtml,
      attachments: attachments,
    });

    if (error) {
      console.error("Resend API Error (CRM):", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send CRM email:", err);
    return { success: false, error: err };
  }
}
