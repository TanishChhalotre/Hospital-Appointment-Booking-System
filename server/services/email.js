const dns = require('dns');
const net = require('net');
const nodemailer = require('nodemailer');

dns.setDefaultResultOrder('ipv4first');

// ── Transporter ──────────────────────────────────────────────────────────────
// nodemailer.createTransport() sets up the connection to the email provider.
// We read credentials from .env so they are never hardcoded in the source code.
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set on Render as environment vars.
// For Gmail: host=smtp.gmail.com, port=465, user=your@gmail.com, pass=App Password
//
// IMPORTANT — why we resolve the host to an IPv4 address first:
// nodemailer 9 resolves BOTH IPv4 (A) and IPv6 (AAAA) records for the host
// and picks one AT RANDOM (it ignores the `family: 4` option entirely).
// Render instances have an IPv6 interface but no IPv6 route, so whenever the
// random pick is IPv6 the connection dies with "ENETUNREACH" and the OTP is
// never sent. Passing an IPv4 literal makes nodemailer skip DNS resolution
// altogether, so the connection is always over IPv4.
async function createTransporter() {
  const hostname = process.env.SMTP_HOST;
  let host = hostname;

  if (hostname && !net.isIP(hostname)) {
    try {
      const [first] = await dns.promises.resolve4(hostname);
      if (first) host = first;
    } catch {
      // If resolve4 fails, fall back to the plain hostname (old behaviour).
    }
  }

  return nodemailer.createTransport({
    host,

    // When we connect to the IP literal above, SNI must still identify the
    // real hostname or Gmail drops the TLS handshake.
    servername: hostname,

    // Gmail SMTP over SSL
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,

    // Prevent signup request from hanging for too long
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

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
  const transporter = await createTransporter();

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
          <p style="color:#0b6e99;font-size:2.5rem;font-weight:800;letter-spacing:8px;margin:0;">${otp}</p>
        </div>
        <p style="color:#6b7280;font-size:0.85rem;">This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="color:#9ca3af;font-size:0.8rem;">If you didn't create an account, ignore this email.</p>
      </div>
    `
  });
}

module.exports = { sendOtpEmail };
