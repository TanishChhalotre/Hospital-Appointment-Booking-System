// ── OTP email (via EmailJS — HTTPS, no SMTP) ─────────────────────────────────
// Why EmailJS instead of Gmail SMTP (nodemailer)?
//
// Render's FREE web services block ALL outbound SMTP traffic (ports 25, 465
// and 587) since September 2025, so nodemailer can never connect from a free
// Render instance — every attempt ends in "Connection timeout" no matter how
// the transporter is configured. EmailJS sends the message from its own
// servers over HTTPS (port 443), which Render always allows. The email still
// comes FROM your connected Gmail account, so recipients see the same
// sender as before.
//
// One-time setup (free, ~10 minutes):
//   1. Sign up at https://www.emailjs.com
//   2. Email Services → Add new → Gmail → "Connect Account" (log in with the
//      Gmail that should send the OTPs and allow "send emails on your behalf")
//   3. Email Templates → Create New Template →
//        To Email : {{email}}
//        Subject  : Your Gurjar Hospital verification code
//        Body     : write it however you like, use the variables {{name}}
//                   and {{otp}} where they should appear
//   4. Render dashboard → Environment: add EMAILJS_SERVICE_ID,
//      EMAILJS_TEMPLATE_ID and EMAILJS_PUBLIC_KEY
//      (Public Key: EmailJS dashboard → Integrations → API Keys)

async function sendOtpEmail(email, name, otp) {
  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'EmailJS is not configured. Add EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID ' +
      'and EMAILJS_PUBLIC_KEY to the Render environment variables.'
    );
  }

  const body = {
    service_id:    serviceId,
    template_id:   templateId,
    user_id:       publicKey,
    template_params: { email, name, otp },
  };

  // Private key is optional but recommended by EmailJS (Integrations → API Keys)
  if (process.env.EMAILJS_PRIVATE_KEY) {
    body.accessToken = process.env.EMAILJS_PRIVATE_KEY;
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`EmailJS send failed (HTTP ${response.status}): ${detail}`);
  }
}

module.exports = { sendOtpEmail };
