/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
// Email notification edge function for Supabase

// @ts-expect-error Deno global is provided by the runtime
const RESEND_API_KEY = Deno.env.get('VITE_RESEND_API_KEY');
// @ts-expect-error Deno global is provided by the runtime
const SITE_URL = Deno.env.get('SITE_URL') || 'https://dreamweave.mw';
const FROM_EMAIL = 'DreamWeave <notifications@dreamweave.mw>';

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

function kycApprovedHtml(userName: string) {
  return `
    <h1>Congratulations ${userName}!</h1>
    <p>Your KYC verification has been approved. You can now start selling on DreamWeave.</p>
    <p>Start creating your first listing and reach thousands of potential buyers!</p>
    <a href="${SITE_URL}/create-listing" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">Create Your First Listing</a>
  `;
}

function listingApprovedHtml(userName: string, listingTitle: string, listingId: string) {
  return `
    <h1>Great news ${userName}!</h1>
    <p>Your listing "${listingTitle}" has been approved and is now live on DreamWeave.</p>
    <p>Start receiving messages from potential buyers!</p>
    <a href="${SITE_URL}/listing/${listingId}" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">View Your Listing</a>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const { event, userEmail, userName, listingTitle, listingId } = body;
  if (!event || !userEmail || !userName) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  try {
    if (event === 'kyc_approved') {
      await sendEmail({
        to: userEmail,
        subject: 'Your KYC Verification is Complete!',
        html: kycApprovedHtml(userName),
      });
      return new Response(JSON.stringify({ success: true, message: 'KYC approval email sent' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else if (event === 'listing_approved') {
      if (!listingTitle || !listingId) {
        return new Response(JSON.stringify({ error: 'Missing listingTitle or listingId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      await sendEmail({
        to: userEmail,
        subject: 'Your Listing Has Been Approved!',
        html: listingApprovedHtml(userName, listingTitle, listingId),
      });
      return new Response(JSON.stringify({ success: true, message: 'Listing approval email sent' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'Unknown event type' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to send email' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}); 