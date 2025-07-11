
/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
// Email notification edge function for Supabase

// @ts-expect-error Deno global is provided by the runtime
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// @ts-expect-error Deno global is provided by the runtime
const SITE_URL = Deno.env.get('SITE_URL') || 'https://dreamweavemw.com';
export {};

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DreamWeave <notifications@dreamweavemw.com>',
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

function kycApprovedHtml(userName: string) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(79,70,229,0.08); padding: 32px;">
      <img src="https://dreamweave.mw/logo.png" alt="DreamWeave" style="width: 48px; display: block; margin: 0 auto 16px;" />
      <h1 style="color: #1e293b; text-align: center; margin-bottom: 8px;">Congratulations, ${userName}!</h1>
      <p style="color: #334155; text-align: center; font-size: 1.1em; margin-bottom: 24px;">
        Your KYC verification has been <b style="color: #22c55e;">approved</b>.<br>
        You can now start selling on DreamWeave!
      </p>
      <p style="color: #64748b; text-align: center; margin-bottom: 32px;">
        Start creating your first listing and reach thousands of potential buyers.
      </p>
      <div style="text-align: center;">
        <a href="${SITE_URL}/create-listing" style="
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
        ">Create Your First Listing</a>
      </div>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; text-align: center; font-size: 0.95em;">
        Need help? <a href="${SITE_URL}/contact" style="color: #4F46E5; text-decoration: underline;">Contact Support</a>
      </p>
    </div>
  </div>
  `;
}

function listingApprovedHtml(userName: string, listingTitle: string, listingId: string) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(79,70,229,0.08); padding: 32px;">
      <img src="https://dreamweave.mw/logo.png" alt="DreamWeave" style="width: 48px; display: block; margin: 0 auto 16px;" />
      <h1 style="color: #1e293b; text-align: center; margin-bottom: 8px;">Great news, ${userName}!</h1>
      <p style="color: #334155; text-align: center; font-size: 1.1em; margin-bottom: 24px;">
        Your listing <b style="color: #4F46E5;">"${listingTitle}"</b> has been <b style="color: #22c55e;">approved</b> and is now live on DreamWeave.
      </p>
      <p style="color: #64748b; text-align: center; margin-bottom: 32px;">
        Start receiving messages from potential buyers!
      </p>
      <div style="text-align: center;">
        <a href="${SITE_URL}/listing/${listingId}" style="
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
        ">View Your Listing</a>
      </div>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; text-align: center; font-size: 0.95em;">
        Need help? <a href="${SITE_URL}/contact" style="color: #4F46E5; text-decoration: underline;">Contact Support</a>
      </p>
    </div>
  </div>
  `;
}

function listingSubmittedHtml(userName: string, listingTitle: string, listingId: string) {
  return `
    <h1>Thank you for listing on DreamWeave!</h1>
    <p>Your listing "${listingTitle}" has been submitted successfully and is pending review.</p>
    <p>We'll notify you once your listing is approved.</p>
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

globalThis.Deno?.serve?.(async (req: Request) => {
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
      return new Response(JSON.stringify({ success: true, message: 'KYC approval email sent' }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    } else if (event === 'listing_approved') {
      if (!listingTitle || !listingId) {
        return new Response(JSON.stringify({ error: 'Missing listingTitle or listingId' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
      await sendEmail({
        to: userEmail,
        subject: 'Your Listing Has Been Approved!',
        html: listingApprovedHtml(userName, listingTitle, listingId),
      });
      return new Response(JSON.stringify({ success: true, message: 'Listing approval email sent' }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    } else if (event === 'listing_submitted') {
      if (!listingTitle || !listingId) {
        return new Response(JSON.stringify({ error: 'Missing listingTitle or listingId' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
      // Send the "listing approved" email instead of "listing submitted"
      await sendEmail({
        to: userEmail,
        subject: 'Your Listing is Now Live!',
        html: listingApprovedHtml(userName, listingTitle, listingId), // <-- use the approved template
      });
      return new Response(JSON.stringify({ success: true, message: 'Listing live email sent' }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    } else {
      return new Response(JSON.stringify({ error: 'Unknown event type' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
  } catch (error: any) {
    console.log("Email function error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to send email' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}); 