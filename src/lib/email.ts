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
    console.log("RESEND_API_KEY missing. Mock email sent to:", guestEmail);
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
