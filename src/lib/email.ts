import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

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
      from: 'DreamWeave <notifications@dreamweavemw.com>',
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
    <a href="${import.meta.env.VITE_SITE_URL}/create-listing" style="
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
    <a href="${import.meta.env.VITE_SITE_URL}/listing/${listingId}" style="
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
    <a href="${import.meta.env.VITE_SITE_URL}/listing/${listingId}" style="
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

// Request Order Email Notifications
export const sendRequestOrderPricedEmail = async (
  userEmail: string,
  userName: string,
  itemName: string,
  adminPrice: number,
  orderId: string
) => {
  const subject = 'Your Request Order Has Been Priced!';
  const depositAmount = adminPrice * 0.5;
  const html = `
    <h1>Great news ${userName}!</h1>
    <p>Your request for "${itemName}" has been reviewed and priced.</p>
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Order Details:</h3>
      <p><strong>Item:</strong> ${itemName}</p>
      <p><strong>Total Price:</strong> MWK ${adminPrice.toLocaleString()}</p>
      <p><strong>Deposit Required (50%):</strong> MWK ${depositAmount.toLocaleString()}</p>
    </div>
    <p>Please make your deposit payment to proceed with the order.</p>
    <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">Pay Deposit Now</a>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendRequestOrderShippedEmail = async (
  userEmail: string,
  userName: string,
  itemName: string,
  adminPrice: number,
  orderId: string
) => {
  const subject = 'Your Request Order Has Been Shipped!';
  const remainingAmount = adminPrice * 0.5;
  const html = `
    <h1>Exciting news ${userName}!</h1>
    <p>Your request for "${itemName}" has been shipped and is on its way to you.</p>
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Order Details:</h3>
      <p><strong>Item:</strong> ${itemName}</p>
      <p><strong>Total Price:</strong> MWK ${adminPrice.toLocaleString()}</p>
      <p><strong>Remaining Balance:</strong> MWK ${remainingAmount.toLocaleString()}</p>
    </div>
    <p>Please complete the final payment to receive your order.</p>
    <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">Pay Final Balance</a>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendRequestOrderDeliveredEmail = async (
  userEmail: string,
  userName: string,
  itemName: string,
  orderId: string
) => {
  const subject = 'Your Request Order Has Been Delivered!';
  const html = `
    <h1>Congratulations ${userName}!</h1>
    <p>Your request for "${itemName}" has been successfully delivered.</p>
    <p>Thank you for using Dream Weave Dubai for your shopping needs!</p>
    <a href="${import.meta.env.VITE_SITE_URL}/request-order" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">Request Another Item</a>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendRequestOrderSubmittedEmail = async (
  userEmail: string,
  userName: string,
  itemName: string,
  orderId: string
) => {
  const subject = 'Your Request Order Has Been Submitted!';
  const html = `
    <h1>Thank you ${userName}!</h1>
    <p>Your request for "${itemName}" has been submitted successfully.</p>
    <p>Our team will review your request and get back to you with pricing and availability.</p>
    <p>You'll receive an email notification once your request has been reviewed.</p>
    <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 16px;
    ">View Your Orders</a>
  `;

  return sendEmail({ to: userEmail, subject, html });
}; 