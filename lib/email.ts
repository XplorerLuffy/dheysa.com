import { Resend } from 'resend';
import { formatCurrency, formatDateRange } from '@/lib/format';

// Transactional email only. Booking creation must never fail because email
// did — every call site wraps this in try/catch and swallows errors.
// RESEND_API_KEY is not set by default; until the user adds one (and a
// verified sending domain), sends just no-op with a console warning.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'DheySa <onboarding@resend.dev>';

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendBookingConfirmationEmail(params: {
  to: string;
  listingTitle: string;
  listingLocation: string;
  checkIn: string | null;
  checkOut: string | null;
  bookingDate: string | null;
  guests: number;
  totalPrice: number;
  currency: string;
  bookingId: string;
  hostBusinessName: string | null;
  hostContactPhone: string | null;
}): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn('sendBookingConfirmationEmail: RESEND_API_KEY not set, skipping email send.');
    return;
  }

  const dates =
    params.checkIn && params.checkOut
      ? formatDateRange(params.checkIn, params.checkOut)
      : (params.bookingDate ?? '');
  const total = formatCurrency(params.totalPrice, params.currency);

  const hostLine =
    params.hostBusinessName || params.hostContactPhone
      ? `<p style="margin:16px 0 0;color:#4b5563;font-size:14px;">Hosted by ${
          params.hostBusinessName ?? ''
        }${params.hostContactPhone ? ` &middot; ${params.hostContactPhone}` : ''}</p>`
      : '';

  await client.emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: `Booking confirmed: ${params.listingTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h1 style="font-size:20px;color:#111827;">Your DheySa booking is confirmed</h1>
        <p style="color:#4b5563;font-size:14px;">${params.listingTitle} &middot; ${params.listingLocation}</p>
        <table style="width:100%;margin-top:16px;font-size:14px;color:#111827;">
          <tr><td style="padding:4px 0;color:#6b7280;">Dates</td><td style="padding:4px 0;text-align:right;">${dates}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Guests</td><td style="padding:4px 0;text-align:right;">${params.guests}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Total</td><td style="padding:4px 0;text-align:right;font-weight:bold;">${total}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Booking ID</td><td style="padding:4px 0;text-align:right;font-family:monospace;font-size:12px;">${params.bookingId}</td></tr>
        </table>
        ${hostLine}
        <p style="margin-top:24px;color:#6b7280;font-size:12px;">See full details anytime at dheysa.com/trips/${params.bookingId}</p>
      </div>
    `,
  });
}
