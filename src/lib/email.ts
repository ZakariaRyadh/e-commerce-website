import { Resend } from "resend";

const FROM = "LUMA <onboarding@resend.dev>";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function send(opts: { to: string; subject: string; html: string }) {
  const client = getClient();
  if (!client) {
    // No email provider configured yet — log instead of failing.
    // Set RESEND_API_KEY in .env to enable real sending.
    console.log(`[email skipped — no RESEND_API_KEY] to=${opts.to} subject="${opts.subject}"`);
    return { sent: false };
  }
  try {
    await client.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
    return { sent: true };
  } catch (e) {
    console.error("Email send failed:", e);
    return { sent: false };
  }
}

export async function sendOrderConfirmationEmail(opts: {
  to: string;
  customerName: string;
  orderId: string;
  total: string;
  items: { name: string; qty: number; size?: string | null; color?: string | null }[];
}) {
  const itemsHtml = opts.items
    .map(
      (i) =>
        `<li>${i.qty}× ${i.name}${i.size || i.color ? ` (${[i.size, i.color].filter(Boolean).join(" / ")})` : ""}</li>`
    )
    .join("");

  return send({
    to: opts.to,
    subject: `Order confirmed — #${opts.orderId.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2 style="margin-bottom: 4px;">Thanks for your order, ${opts.customerName}!</h2>
        <p style="color: #666;">Order #${opts.orderId.slice(0, 8).toUpperCase()} is confirmed and being processed.</p>
        <ul style="padding-left: 18px; color: #333;">${itemsHtml}</ul>
        <p style="font-weight: 600; font-size: 16px;">Total: $${opts.total}</p>
        <p style="color: #999; font-size: 13px;">You can track your order anytime from your account page.</p>
      </div>
    `,
  });
}

export async function sendContactReceivedEmail(opts: { to: string; name: string }) {
  return send({
    to: opts.to,
    subject: "We received your message",
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Thanks for reaching out, ${opts.name}!</h2>
        <p style="color: #666;">We've received your message and our team will get back to you shortly.</p>
      </div>
    `,
  });
}

export async function sendContactAdminNotification(opts: {
  adminEmail: string;
  name: string;
  email: string;
  message: string;
}) {
  return send({
    to: opts.adminEmail,
    subject: `New contact message from ${opts.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>New contact message</h2>
        <p><strong>From:</strong> ${opts.name} (${opts.email})</p>
        <p style="color: #333; white-space: pre-wrap;">${opts.message}</p>
      </div>
    `,
  });
}

export async function sendPasswordResetOtpEmail(opts: { to: string; code: string }) {
  return send({
    to: opts.to,
    subject: "Your LUMA password reset code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Reset your password</h2>
        <p style="color: #666;">Use this code to reset your password. It expires in 10 minutes.</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; background:#f5f5f4; padding: 16px 24px; border-radius: 12px; text-align:center;">${opts.code}</p>
        <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
