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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💰 Your Order Has Been Priced!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dream Weave Dubai</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          Great news! We've found your requested item <strong>"${itemName}"</strong> and have priced it for you.
        </p>
        
        <div style="background: #f8f9fa; border: 2px solid #4CAF50; padding: 25px; margin: 25px 0; border-radius: 10px;">
          <h3 style="color: #4CAF50; margin: 0 0 20px 0; text-align: center;">📋 Order Details</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="font-weight: 600; color: #333;">Item:</span>
            <span style="color: #555;">${itemName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="font-weight: 600; color: #333;">Total Price:</span>
            <span style="color: #4CAF50; font-weight: 600; font-size: 18px;">MWK ${adminPrice.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0;">
            <span style="font-weight: 600; color: #333;">Deposit Required (50%):</span>
            <span style="color: #ff6b35; font-weight: 600; font-size: 18px;">MWK ${depositAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">⚡ Next Steps:</h4>
          <ol style="color: #856404; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Pay the 50% deposit to secure your order</li>
            <li style="margin-bottom: 8px;">We'll source and prepare your item</li>
            <li style="margin-bottom: 0;">Pay the remaining balance when item is shipped</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
            display: inline-block;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            transition: all 0.3s ease;
          ">💳 Pay Deposit Now</a>
        </div>
        
        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            Need help? Contact our support team for assistance with your payment.
          </p>
        </div>
      </div>
    </div>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🚚 Your Order Has Been Shipped!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dream Weave Dubai</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          Exciting news! Your requested item <strong>"${itemName}"</strong> has been shipped and is on its way to you! 🎉
        </p>
        
        <div style="background: #f8f9fa; border: 2px solid #ff6b35; padding: 25px; margin: 25px 0; border-radius: 10px;">
          <h3 style="color: #ff6b35; margin: 0 0 20px 0; text-align: center;">📦 Shipping Details</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="font-weight: 600; color: #333;">Item:</span>
            <span style="color: #555;">${itemName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="font-weight: 600; color: #333;">Total Price:</span>
            <span style="color: #4CAF50; font-weight: 600; font-size: 18px;">MWK ${adminPrice.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0;">
            <span style="font-weight: 600; color: #333;">Remaining Balance:</span>
            <span style="color: #ff6b35; font-weight: 600; font-size: 18px;">MWK ${remainingAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <div style="background: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #1976d2; margin: 0 0 10px 0;">📋 Important Information:</h4>
          <ul style="color: #1976d2; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Your item is now en route from Dubai UAE</li>
            <li style="margin-bottom: 8px;">Please complete the final payment to receive your order</li>
            <li style="margin-bottom: 0;">You'll receive delivery updates as your package progresses</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
            display: inline-block;
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
            transition: all 0.3s ease;
          ">💳 Pay Final Balance</a>
        </div>
        
        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            Track your order status anytime by visiting your orders page.
          </p>
        </div>
      </div>
    </div>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Your Order Has Been Delivered!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dream Weave Dubai</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${userName}! 🎊</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          Your requested item <strong>"${itemName}"</strong> has been successfully delivered to your doorstep!
        </p>
        
        <div style="background: #f3e5f5; border: 2px solid #9c27b0; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center;">
          <h3 style="color: #9c27b0; margin: 0 0 15px 0;">✅ Delivery Complete</h3>
          <p style="color: #555; margin: 0;">
            Your order has been successfully delivered and is ready for you to enjoy!
          </p>
        </div>
        
        <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #2e7d32; margin: 0 0 10px 0;">💝 Thank You!</h4>
          <p style="color: #2e7d32; margin: 0;">
            Thank you for choosing Dream Weave Dubai for your shopping needs. We hope you love your new item!
          </p>
        </div>
        
        <div style="background: #fff3e0; border: 1px solid #ff9800; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #e65100; margin: 0 0 10px 0;">⭐ We'd Love Your Feedback</h4>
          <p style="color: #e65100; margin: 0;">
            Share your experience with us and help other customers discover the quality of our service.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${import.meta.env.VITE_SITE_URL}/request-order" style="
            display: inline-block;
            background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
            transition: all 0.3s ease;
          ">🛍️ Request Another Item</a>
        </div>
        
        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            Need anything else? We're here to help you find your next perfect item from Dubai UAE!
          </p>
        </div>
      </div>
    </div>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Request Submitted Successfully!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dream Weave Dubai</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          Thank you for submitting your request for <strong>"${itemName}"</strong>. We're excited to help you find exactly what you're looking for!
        </p>
        
        <div style="background: #f8f9fa; border-left: 4px solid #4F46E5; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #4F46E5; margin: 0 0 15px 0;">📋 What happens next?</h3>
          <ul style="color: #555; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Our team will review your request within 24-48 hours</li>
            <li style="margin-bottom: 8px;">We'll source the best quality items from Dubai UAE</li>
            <li style="margin-bottom: 8px;">You'll receive pricing and availability information</li>
            <li style="margin-bottom: 0;">Once approved, you can make your deposit payment</li>
          </ul>
        </div>
        
        <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="color: #2e7d32; margin: 0; font-weight: 500;">
            📧 <strong>Stay Updated:</strong> You'll receive email notifications at every step of the process.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
            display: inline-block;
            background: linear-gradient(135deg, #4F46E5 0%, #667eea 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
            transition: all 0.3s ease;
          ">View Your Orders</a>
        </div>
        
        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            If you have any questions, please don't hesitate to contact our support team.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}; 

// Additional Request Order Email Notifications
export const sendRequestOrderRejectedEmail = async (
  userEmail: string,
  userName: string,
  itemName: string,
  orderId: string,
  rejectionReason?: string
) => {
  const subject = 'Request Order Update - Item Not Available';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚠️ Request Order Update</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dream Weave Dubai</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          We regret to inform you that we are unable to fulfill your request for <strong>"${itemName}"</strong> at this time.
        </p>
        
        ${rejectionReason ? `
        <div style="background: #ffebee; border: 1px solid #f44336; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #c62828; margin: 0 0 10px 0;">📝 Reason:</h4>
          <p style="color: #c62828; margin: 0;">${rejectionReason}</p>
        </div>
        ` : ''}
        
        <div style="background: #fff3e0; border: 1px solid #ff9800; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #e65100; margin: 0 0 10px 0;">💡 What you can do:</h4>
          <ul style="color: #e65100; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Try requesting a similar item with different specifications</li>
            <li style="margin-bottom: 8px;">Browse our available products from Dubai UAE</li>
            <li style="margin-bottom: 0;">Contact us for alternative suggestions</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${import.meta.env.VITE_SITE_URL}/request-order" style="
            display: inline-block;
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
            transition: all 0.3s ease;
          ">🔄 Request Another Item</a>
        </div>
        
        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            We apologize for any inconvenience. Please don't hesitate to contact us for assistance.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendRequestOrderProcessingEmail = async (
  userEmail: string,
  userName: string,
  itemName: string,
  orderId: string
) => {
  const subject = 'Your Request Order is Being Processed!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚙️ Order Processing Started!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dream Weave Dubai</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          Great news! We've started processing your request for <strong>"${itemName}"</strong>. Our team is now sourcing and preparing your item.
        </p>
        
        <div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 25px; margin: 25px 0; border-radius: 10px;">
          <h3 style="color: #2196f3; margin: 0 0 20px 0; text-align: center;">🔄 Processing Status</h3>
          <div style="text-align: center;">
            <p style="color: #555; margin: 0;">
              Your order is now being processed and prepared for shipment from Dubai UAE.
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <h4 style="color: #2196f3; margin: 0 0 15px 0;">📋 What happens next?</h4>
          <ul style="color: #555; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">We're sourcing the best quality item for you</li>
            <li style="margin-bottom: 8px;">Quality checking and packaging</li>
            <li style="margin-bottom: 0;">Preparation for shipment</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
            display: inline-block;
            background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
            transition: all 0.3s ease;
          ">📊 Track Your Order</a>
        </div>
        
        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            We'll notify you as soon as your order is ready for shipment.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendRequestOrderReadyForPickupEmail = async (
  userEmail: string,
  userName: string,
  itemName: string,
  orderId: string,
  pickupLocation?: string
) => {
  const subject = 'Your Request Order is Ready for Pickup!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📦 Ready for Pickup!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dream Weave Dubai</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          Excellent news! Your requested item <strong>"${itemName}"</strong> is now ready for pickup.
        </p>
        
        <div style="background: #e8f5e8; border: 2px solid #4caf50; padding: 25px; margin: 25px 0; border-radius: 10px;">
          <h3 style="color: #4caf50; margin: 0 0 20px 0; text-align: center;">✅ Pickup Details</h3>
          ${pickupLocation ? `
          <div style="text-align: center; margin-bottom: 15px;">
            <p style="color: #555; margin: 0;"><strong>Pickup Location:</strong></p>
            <p style="color: #4caf50; font-weight: 600; margin: 0;">${pickupLocation}</p>
          </div>
          ` : ''}
          <div style="text-align: center;">
            <p style="color: #555; margin: 0;">
              Your order is ready and waiting for you to collect!
            </p>
          </div>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">📋 Important Information:</h4>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Please bring a valid ID for pickup verification</li>
            <li style="margin-bottom: 8px;">Complete any remaining payment before pickup</li>
            <li style="margin-bottom: 0;">Contact us if you need to arrange delivery instead</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
            display: inline-block;
            background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            transition: all 0.3s ease;
          ">📊 View Order Details</a>
        </div>
        
        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            We look forward to seeing you! Please contact us if you have any questions.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}; 

// Password Reset Email
export const sendPasswordResetEmail = async (
  userEmail: string,
  resetLink: string
) => {
  const subject = 'Reset Your DreamWeave Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4F46E5 0%, #667eea 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">DreamWeave</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          We received a request to reset your password for your DreamWeave account. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="background: #f8f9fa; border: 2px solid #4F46E5; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center;">
          <h3 style="color: #4F46E5; margin: 0 0 20px 0;">Reset Your Password</h3>
          <p style="color: #555; margin-bottom: 25px;">
            Click the button below to create a new password for your account.
          </p>
          
          <a href="${resetLink}" style="
            display: inline-block;
            background: linear-gradient(135deg, #4F46E5 0%, #667eea 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
            transition: all 0.3s ease;
          ">Reset Password</a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ Important Security Notes:</h4>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">This link will expire in 1 hour for security reasons</li>
            <li style="margin-bottom: 8px;">If you didn't request this reset, please ignore this email</li>
            <li style="margin-bottom: 0;">For security, this link can only be used once</li>
          </ul>
        </div>
        
        <div style="background: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #1976d2; margin: 0 0 10px 0;">🔗 Alternative Method:</h4>
          <p style="color: #1976d2; margin: 0;">
            If the button above doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #1976d2; margin: 10px 0 0 0; word-break: break-all; font-size: 14px;">
            ${resetLink}
          </p>
        </div>
        
        <div style="border-top: 1px solid #e1e5e9; padding-top: 20px; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            If you have any questions or need assistance, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}; 