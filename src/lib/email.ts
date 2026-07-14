import nodemailer from 'nodemailer';

interface BookingEmailData {
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

const BRAND = {
  green: '#2D4A3E',
  beige: '#F8F6F1',
  gold: '#A38C5D',
  dark: '#1A1A1A',
  white: '#FFFFFF',
  muted: '#6B7280',
};

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

/** Accepts comma or semicolon separated emails. */
export function parseSalonEmails(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]+/)
    .map((e) => e.trim())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.beige};font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.beige};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:${BRAND.white};border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(45,74,62,0.12);">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.green};padding:28px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:${BRAND.gold};">NATURALLY ROOTED</p>
              <p style="margin:0;font-size:22px;font-weight:400;color:${BRAND.white};letter-spacing:0.02em;">${title}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.beige};padding:24px 32px;border-top:1px solid rgba(45,74,62,0.08);text-align:center;">
              <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND.green};">Naturally Rooted Salon</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.muted};">UI, Ibadan · 0810 765 1999 · @naturallyrooted_salon</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string, last = false): string {
  const border = last ? '' : `border-bottom:1px solid rgba(45,74,62,0.08);`;
  return `
    <tr>
      <td style="padding:14px 0;${border}font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.gold};width:36%;vertical-align:top;">
        ${label}
      </td>
      <td style="padding:14px 0;${border}font-family:Georgia,'Times New Roman',serif;font-size:16px;color:${BRAND.green};vertical-align:top;">
        ${value}
      </td>
    </tr>`;
}

function buildSalonEmailHtml(booking: BookingEmailData): string {
  const name = escapeHtml(booking.name);
  const service = escapeHtml(booking.service);
  const date = escapeHtml(booking.date);
  const time = escapeHtml(booking.time);
  const email = escapeHtml(booking.email);
  const phone = escapeHtml(booking.phone);

  const body = `
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${BRAND.gold};">New Appointment</p>
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:400;color:${BRAND.green};">A client just booked online</h1>
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${BRAND.muted};">
      Review the details below and confirm the appointment with the client.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.beige};border-radius:16px;padding:8px 20px;">
      <tr>
        <td style="padding:8px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${detailRow('Service', service)}
            ${detailRow('Date', date)}
            ${detailRow('Time', time)}
            ${detailRow('Client', name)}
            ${detailRow('Email', `<a href="mailto:${email}" style="color:${BRAND.green};text-decoration:none;">${email}</a>`)}
            ${detailRow('Phone', `<a href="tel:${phone}" style="color:${BRAND.green};text-decoration:none;">${phone}</a>`, true)}
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
      <tr>
        <td style="background-color:rgba(163,140,93,0.12);border-left:4px solid ${BRAND.gold};border-radius:0 12px 12px 0;padding:14px 18px;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.dark};">
            Status: <strong style="color:${BRAND.gold};">Pending</strong> — please confirm with the client.
          </p>
        </td>
      </tr>
    </table>
  `;

  return emailShell('New Booking Alert', body);
}

function buildCustomerEmailHtml(booking: BookingEmailData): string {
  const name = escapeHtml(booking.name);
  const service = escapeHtml(booking.service);
  const date = escapeHtml(booking.date);
  const time = escapeHtml(booking.time);

  const body = `
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${BRAND.gold};">Booking Received</p>
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:400;color:${BRAND.green};">Hi ${name},</h1>
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${BRAND.muted};">
      Thank you for booking with <strong style="color:${BRAND.green};">Naturally Rooted Salon</strong>. We have received your appointment request and will confirm shortly.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.beige};border-radius:16px;">
      <tr>
        <td style="padding:8px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${detailRow('Service', service)}
            ${detailRow('Date', date)}
            ${detailRow('Time', time, true)}
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${BRAND.muted};">
      Questions? Call us at <strong style="color:${BRAND.green};">0810 765 1999</strong> or DM us on Instagram
      <strong style="color:${BRAND.green};">@naturallyrooted_salon</strong>.
    </p>
    <p style="margin:20px 0 0;font-style:italic;font-size:15px;color:${BRAND.green};">
      — The Naturally Rooted Team
    </p>
  `;

  return emailShell("You're Almost Booked", body);
}

export async function sendBookingEmails(booking: BookingEmailData) {
  const transporter = getTransporter();
  const salonEmails = parseSalonEmails(process.env.SALON_NOTIFICATION_EMAIL);

  if (!transporter || salonEmails.length === 0) {
    console.warn(
      'Email not configured. Set GMAIL_USER, GMAIL_APP_PASSWORD, and SALON_NOTIFICATION_EMAIL (one or more, comma-separated).',
    );
    return { sent: false, reason: 'not_configured' as const };
  }

  const fromName = 'Naturally Rooted Salon';
  const from = `"${fromName}" <${process.env.GMAIL_USER}>`;

  await Promise.all([
    transporter.sendMail({
      from,
      to: salonEmails,
      subject: `New Booking: ${booking.service} — ${booking.name}`,
      html: buildSalonEmailHtml(booking),
    }),
    transporter.sendMail({
      from,
      to: booking.email,
      subject: `Booking Received — ${booking.service} at Naturally Rooted Salon`,
      html: buildCustomerEmailHtml(booking),
    }),
  ]);

  return { sent: true as const, salonRecipients: salonEmails };
}
