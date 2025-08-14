/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
// Amazon UAE Email notification edge function for Supabase

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

function generateOrderConfirmationTemplate(order: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your Amazon UAE purchase</p>
        </div>
        
        <div class="content">
          <h2>Hello ${order.delivery_address.full_name},</h2>
          <p>Great news! Your order has been confirmed and is now being processed. We're excited to get your Amazon UAE products to you!</p>
          
          <div class="order-details">
            <h3>📦 Order Details</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> MWK ${order.total_amount.toLocaleString()}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(order.estimated_delivery).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status-badge">Confirmed</span></p>
          </div>
          
          <div class="order-details">
            <h3>📍 Delivery Address</h3>
            <p>${order.delivery_address.address_line1}</p>
            ${order.delivery_address.address_line2 ? `<p>${order.delivery_address.address_line2}</p>` : ''}
            <p>${order.delivery_address.city}, ${order.delivery_address.postal_code}</p>
            <p>${order.delivery_address.country}</p>
          </div>
          
          <p>We'll keep you updated on your order progress every step of the way. You'll receive notifications when your order is processed, shipped, and delivered.</p>
          
          <a href="${SITE_URL}/amazon/orders" class="button">View My Orders</a>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing DreamWeave for your Amazon UAE purchases!</p>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOrderStatusUpdateTemplate(order: any, newStatus: string): string {
  const statusColors = {
    'pending': '#f59e0b',
    'processing': '#3b82f6',
    'shipped': '#8b5cf6',
    'delivered': '#10b981',
    'cancelled': '#ef4444'
  };

  const statusEmojis = {
    'pending': '⏳',
    'processing': '⚙️',
    'shipped': '🚚',
    'delivered': '✅',
    'cancelled': '❌'
  };

  const statusColor = statusColors[newStatus as keyof typeof statusColors] || '#6b7280';
  const statusEmoji = statusEmojis[newStatus as keyof typeof statusEmojis] || '📦';

  const getStatusDescription = (status: string): string => {
    const descriptions = {
      'pending': 'Your order is being reviewed and will be processed soon.',
      'processing': 'Your order is being prepared and will be shipped shortly.',
      'shipped': 'Your order is on its way! You can track its progress.',
      'delivered': 'Your order has been successfully delivered to your address.',
      'cancelled': 'Your order has been cancelled. Please contact support if you have questions.'
    };
    
    return descriptions[status as keyof typeof descriptions] || 'Your order status has been updated.';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-update { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor}; text-align: center; }
        .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusEmoji} Order Status Update</h1>
          <p>Your Amazon UAE order has been updated</p>
        </div>
        
        <div class="content">
          <h2>Hello ${order.delivery_address.full_name},</h2>
          <p>We have an update on your Amazon UAE order!</p>
          
          <div class="status-update">
            <h3>Current Status</h3>
            <div class="status-badge">${newStatus.toUpperCase()}</div>
            <p style="margin-top: 15px; font-size: 16px;">
              ${getStatusDescription(newStatus)}
            </p>
          </div>
          
          <div class="order-details">
            <h3>📦 Order Information</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> MWK ${order.total_amount.toLocaleString()}</p>
            ${order.tracking_number ? `<p><strong>Tracking Number:</strong> ${order.tracking_number}</p>` : ''}
          </div>
          
          <p>We're working hard to get your order to you as quickly as possible. You'll receive another update when your order status changes again.</p>
          
          <a href="${SITE_URL}/amazon/orders" class="button">Track My Order</a>
        </div>
        
        <div class="footer">
          <p>Thank you for your patience and for choosing DreamWeave!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDeliveryNotificationTemplate(order: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .delivery-success { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; text-align: center; }
        .success-badge { display: inline-block; background: #10b981; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Order Has Been Delivered!</h1>
          <p>Your Amazon UAE purchase has arrived</p>
        </div>
        
        <div class="content">
          <h2>Hello ${order.delivery_address.full_name},</h2>
          <p>Excellent news! Your Amazon UAE order has been successfully delivered to your doorstep.</p>
          
          <div class="delivery-success">
            <h3>✅ Delivery Successful</h3>
            <div class="success-badge">DELIVERED</div>
            <p style="margin-top: 15px; font-size: 16px;">
              Your order has been delivered to the specified address
            </p>
          </div>
          
          <div class="order-details">
            <h3>📦 Delivery Details</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Delivery Address:</strong></p>
            <p style="margin-left: 20px;">
              ${order.delivery_address.address_line1}<br>
              ${order.delivery_address.address_line2 ? `${order.delivery_address.address_line2}<br>` : ''}
              ${order.delivery_address.city}, ${order.delivery_address.postal_code}<br>
              ${order.delivery_address.country}
            </p>
          </div>
          
          <p>We hope you love your Amazon UAE products! If you have any issues with your order or need assistance, please don't hesitate to contact our support team.</p>
          
          <a href="${SITE_URL}/amazon/orders" class="button">View My Orders</a>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing DreamWeave for your Amazon UAE purchases!</p>
          <p>We look forward to serving you again soon.</p>
        </div>
      </div>
    </body>
    </html>
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { 
      status: 400, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });
  }

  const { event, userEmail, order, newStatus } = body;
  
  if (!event || !userEmail) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
      status: 400, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });
  }

  try {
    if (event === 'order_confirmation') {
      if (!order) {
        return new Response(JSON.stringify({ error: 'Missing order data' }), { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        });
      }
      
      await sendEmail({
        to: userEmail,
        subject: `Order Confirmed - ${order.order_number}`,
        html: generateOrderConfirmationTemplate(order),
      });
      
      return new Response(JSON.stringify({ success: true, message: 'Order confirmation email sent' }), { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    } else if (event === 'order_status_update') {
      if (!order || !newStatus) {
        return new Response(JSON.stringify({ error: 'Missing order data or new status' }), { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        });
      }
      
      await sendEmail({
        to: userEmail,
        subject: `Order Update - ${order.order_number}`,
        html: generateOrderStatusUpdateTemplate(order, newStatus),
      });
      
      return new Response(JSON.stringify({ success: true, message: 'Order status update email sent' }), { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    } else if (event === 'order_delivered') {
      if (!order) {
        return new Response(JSON.stringify({ error: 'Missing order data' }), { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        });
      }
      
      await sendEmail({
        to: userEmail,
        subject: `Your Order Has Been Delivered - ${order.order_number}`,
        html: generateDeliveryNotificationTemplate(order),
      });
      
      return new Response(JSON.stringify({ success: true, message: 'Delivery notification email sent' }), { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    } else {
      return new Response(JSON.stringify({ error: 'Unknown event type' }), { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    }
  } catch (error: any) {
    console.log("Amazon notification function error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to send email' }), { 
      status: 500, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });
  }
});
