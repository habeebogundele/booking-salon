import nodemailer from 'nodemailer';

interface BookingEmailData {
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

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

export async function sendBookingEmails(booking: BookingEmailData) {
  const transporter = getTransporter();
  const salonEmail = process.env.SALON_NOTIFICATION_EMAIL;

  if (!transporter || !salonEmail) {
    console.warn(
      'Email not configured. Set GMAIL_USER, GMAIL_APP_PASSWORD, and SALON_NOTIFICATION_EMAIL.',
    );
    return { sent: false, reason: 'not_configured' as const };
  }

  const fromName = 'Naturally Rooted Salon';
  const from = `"${fromName}" <${process.env.GMAIL_USER}>`;

  await Promise.all([
    transporter.sendMail({
      from,
      to: salonEmail,
      subject: `New Booking: ${booking.service} — ${booking.name}`,
      html: `
        <h2>New Appointment Request</h2>
        <p>A new booking has been submitted on the website.</p>
        <table cellpadding="8" style="border-collapse:collapse;">
          <tr><td><strong>Service</strong></td><td>${booking.service}</td></tr>
          <tr><td><strong>Date</strong></td><td>${booking.date}</td></tr>
          <tr><td><strong>Time</strong></td><td>${booking.time}</td></tr>
          <tr><td><strong>Name</strong></td><td>${booking.name}</td></tr>
          <tr><td><strong>Email</strong></td><td>${booking.email}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${booking.phone}</td></tr>
        </table>
        <p style="margin-top:16px;color:#666;">Status: <strong>Pending</strong> — please confirm with the client.</p>
      `,
    }),

    transporter.sendMail({
      from,
      to: booking.email,
      subject: `Booking Received — ${booking.service} at Naturally Rooted Salon`,
      html: `
        <h2>Hi ${booking.name},</h2>
        <p>Thank you for booking with <strong>Naturally Rooted Salon</strong>. We have received your appointment request.</p>
        <table cellpadding="8" style="border-collapse:collapse;">
          <tr><td><strong>Service</strong></td><td>${booking.service}</td></tr>
          <tr><td><strong>Date</strong></td><td>${booking.date}</td></tr>
          <tr><td><strong>Time</strong></td><td>${booking.time}</td></tr>
        </table>
        <p>We will review your request and send a confirmation shortly. If you have questions, call us at <strong>0810 765 1999</strong> or DM us on Instagram <strong>@naturallyrooted_salon</strong>.</p>
        <p style="color:#666;">— The Naturally Rooted Team<br/>UI, Ibadan</p>
      `,
    }),
  ]);

  return { sent: true as const };
}
