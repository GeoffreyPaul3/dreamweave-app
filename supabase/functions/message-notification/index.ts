/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
// Email notification edge function for new messages

// @ts-expect-error Deno global is provided by the runtime
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
export {};
const FROM_EMAIL = 'DreamWeave <notifications@dreamweavemw.com>';

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
    throw new Error(data.error || 'Failed to send email');
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
        'Access-Control-Allow-Headers': 'Content-Type',
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
    const html = `
      <h1>Hello ${sellerName},</h1>
      <p>You have received a new message from <strong>${buyerName}</strong>:</p>
      <blockquote style="background:#f3f3f3;padding:12px;border-radius:6px;">${message}</blockquote>
      <p>Reply to this message in your <a href="https://dreamweave.mw/messages">DreamWeave inbox</a>.</p>
    `;
    await sendEmail({ to: sellerEmail, subject, html });
    return new Response(JSON.stringify({ success: true, message: 'Notification email sent' }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to send email' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}); 