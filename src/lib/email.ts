import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'DreamWeave <notifications@dreamweave.mw>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendKYCVerifiedEmail = async (userEmail: string, userName: string) => {
  const subject = 'Your KYC Verification is Complete!';
  const html = `
    <h1>Congratulations ${userName}!</h1>
    <p>Your KYC verification has been approved. You can now start selling on DreamWeave.</p>
    <p>Start creating your first listing and reach thousands of potential buyers!</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/create-listing" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">Create Your First Listing</a>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendListingSubmittedEmail = async (
  userEmail: string,
  userName: string,
  listingTitle: string,
  listingId: string
) => {
  const subject = 'Your Listing Has Been Submitted!';
  const html = `
    <h1>Thank you for listing on DreamWeave!</h1>
    <p>Your listing "${listingTitle}" has been submitted successfully and is pending review.</p>
    <p>We'll notify you once your listing is approved.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/listing/${listingId}" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">View Your Listing</a>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendListingVerifiedEmail = async (
  userEmail: string,
  userName: string,
  listingTitle: string,
  listingId: string
) => {
  const subject = 'Your Listing Has Been Approved!';
  const html = `
    <h1>Great news ${userName}!</h1>
    <p>Your listing "${listingTitle}" has been approved and is now live on DreamWeave.</p>
    <p>Start receiving messages from potential buyers!</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/listing/${listingId}" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">View Your Listing</a>
  `;

  return sendEmail({ to: userEmail, subject, html });
}; 