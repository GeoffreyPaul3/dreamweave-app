import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@1.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, userEmail, userName, listingTitle, listingId } = await req.json()

    let emailSubject = ''
    let emailHtml = ''

    switch (type) {
      case 'kyc_verified':
        emailSubject = 'Your KYC Verification is Complete!'
        emailHtml = `
          <h1>Congratulations ${userName}!</h1>
          <p>Your KYC verification has been approved. You can now start selling on DreamWeave.</p>
          <p>Start creating your first listing and reach thousands of potential buyers!</p>
          <a href="${Deno.env.get('SITE_URL')}/create-listing" style="
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 16px;
          ">Create Your First Listing</a>
        `
        break

      case 'listing_submitted':
        emailSubject = 'Your Listing Has Been Submitted!'
        emailHtml = `
          <h1>Thank you for listing on DreamWeave!</h1>
          <p>Your listing "${listingTitle}" has been submitted successfully and is pending review.</p>
          <p>We'll notify you once your listing is approved.</p>
          <a href="${Deno.env.get('SITE_URL')}/listing/${listingId}" style="
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 16px;
          ">View Your Listing</a>
        `
        break

      case 'listing_verified':
        emailSubject = 'Your Listing Has Been Approved!'
        emailHtml = `
          <h1>Great news ${userName}!</h1>
          <p>Your listing "${listingTitle}" has been approved and is now live on DreamWeave.</p>
          <p>Start receiving messages from potential buyers!</p>
          <a href="${Deno.env.get('SITE_URL')}/listing/${listingId}" style="
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 16px;
          ">View Your Listing</a>
        `
        break

      default:
        throw new Error('Invalid notification type')
    }

    const { data, error } = await resend.emails.send({
      from: 'DreamWeave <notifications@dreamweave.mw>',
      to: userEmail,
      subject: emailSubject,
      html: emailHtml,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 