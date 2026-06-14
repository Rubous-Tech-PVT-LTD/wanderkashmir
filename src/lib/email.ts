import { Resend } from 'resend';

// Only initialize if the key is present to prevent crashes in dev
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendBookingConfirmation(
  guestEmail: string,
  guestName: string,
  bookingDetails: {
    bookingId: string;
    propertyName?: string;
    checkIn?: string;
    checkOut?: string;
    amount: number;
  }
) {
  if (!resend) {

    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'WanderKashmir <bookings@wanderkashmir.com>', // MUST BE A VERIFIED DOMAIN IN RESEND
      to: guestEmail,
      subject: `Booking Confirmed: ${bookingDetails.propertyName || "WanderKashmir Trip"}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Booking Confirmed!</h2>
          <p>Hi ${guestName},</p>
          <p>Thank you for booking with WanderKashmir. Your payment has been received and your booking is confirmed.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
            ${bookingDetails.propertyName ? `<p><strong>Property:</strong> ${bookingDetails.propertyName}</p>` : ''}
            ${bookingDetails.checkIn ? `<p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>` : ''}
            ${bookingDetails.checkOut ? `<p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>` : ''}
            <p><strong>Total Amount:</strong> ₹${bookingDetails.amount.toLocaleString()}</p>
          </div>
          
          <p>We look forward to hosting you in Kashmir!</p>
          <p>Best regards,<br>The WanderKashmir Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: err };
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  if (!resend) {
    console.log(`[MOCK EMAIL] Password Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
    return { success: true, mocked: true };
  }

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'WanderKashmir Support <support@wanderkashmir.com>', // MUST BE A VERIFIED DOMAIN
      to: email,
      subject: `Reset Your WanderKashmir Password`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>You recently requested to reset your password for your WanderKashmir account. Click the button below to reset it. This link is valid for 1 hour.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next hour.</p>
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>The WanderKashmir Team
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:<br>${resetLink}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return { success: false, error: err };
  }
}
