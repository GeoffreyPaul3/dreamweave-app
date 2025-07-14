/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any

// @ts-expect-error Deno global is provided by the runtime
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'DreamWeave <notifications@dreamweave.mw>';

function messageNotificationHtml(sellerName: string, buyerName: string, message: string) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(79,70,229,0.08); padding: 32px;">
      <img src="https://dreamweave.mw/logo.png" alt="DreamWeave" style="width: 48px; display: block; margin: 0 auto 16px;" />
      <h1 style="color: #1e293b; text-align: center; margin-bottom: 8px;">Hello, ${sellerName}!</h1>
      <p style="color: #334155; text-align: center; font-size: 1.1em; margin-bottom: 24px;">
        You have received a new message from <b style="color: #4F46E5;">${buyerName}</b>:
      </p>
      <blockquote style="background: #e0e7ff; color: #3730a3; padding: 16px; border-radius: 8px; margin-bottom: 32px; font-size: 1.05em;">
        ${message}
      </blockquote>
      <div style="text-align: center;">
        <a href="https://dreamweave.mw/messages" style="
          display: inline-block;
          background: linear-gradient(90deg, #4F46E5 0%, #2563eb 100%);
          color: #fff;
          font-weight: 600;
          padding: 14px 32px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 1.1em;
          box-shadow: 0 2px 8px rgba(79,70,229,0.12);
          transition: background 0.2s;
        ">Reply in DreamWeave</a>
      </div>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; text-align: center; font-size: 0.95em;">
        Need help? <a href="https://dreamweave.mw/contact" style="color: #4F46E5; text-decoration: underline;">Contact Support</a>
      </p>
    </div>
  </div>
  `;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.log("Resend API error:", data, "Status:", res.status);
    throw new Error(data.error || JSON.stringify(data) || 'Failed to send email');
  }
  return data;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { event, sellerId, sellerName, buyerName, message } = body;
  if (event !== 'new_message' || !sellerId || !sellerName || !buyerName || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Look up seller's email from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${sellerId}&select=email`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    });
    const profiles = await profileRes.json();
    const sellerEmail = profiles?.[0]?.email;
    if (!sellerEmail) {
      return new Response(JSON.stringify({ error: 'Seller email not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    const subject = `New message from ${buyerName} on DreamWeave`;
    const html = messageNotificationHtml(sellerName, buyerName, message);
    await sendEmail({ to: sellerEmail, subject, html });
    return new Response(JSON.stringify({ success: true, message: 'Notification email sent' }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (error: any) {
    console.log("Message notification function error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to send email' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}); 