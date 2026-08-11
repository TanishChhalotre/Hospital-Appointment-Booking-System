const nodemailer = require('nodemailer');

// ── Transporter ──────────────────────────────────────────────────────────────
// nodemailer.createTransport() sets up the connection to the email provider.
// We read credentials from .env so they are never hardcoded in the source code.
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set on Render as environment vars.
// For Gmail: host=smtp.gmail.com, port=587, user=your@gmail.com, pass=App Password
function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,           // false = STARTTLS on port 587 (true = TLS on port 465)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── sendOtpEmail ─────────────────────────────────────────────────────────────
// Sends the 6-digit OTP to the user's email address.
// otp  : the raw 6-digit string e.g. "482910"
// email: the recipient's email address
// name : used to personalise the greeting
async function sendOtpEmail(email, name, otp) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from:    `"Gurjar Hospital" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Your Gurjar Hospital verification code',
    // Plain-text version for email clients that don't render HTML
    text: `Hi ${name},\n\nYour verification code is: ${otp}\n\nIt expires in 10 minutes. Do not share this code with anyone.\n\nGurjar Hospital`,
    // HTML version — shown in modern email clients
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#0b6e99;margin-bottom:8px;">Gurjar Hospital</h2>
        <p style="color:#4b5563;margin-bottom:24px;">Hi ${name}, please verify your email to complete registration.</p>
        <div style="background:#f0f9ff;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="color:#6b7280;font-size:0.9rem;margin-bottom:8px;">Your verification code</p>
          <p style="font-size:2.5rem;font-weight:800;letter-spacing:8px;color:#0b6e99;margin:0;">${otp}</p>
        </div>
        <p style="color:#6b7280;font-size:0.85rem;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="color:#9ca3af;font-size:0.8rem;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
