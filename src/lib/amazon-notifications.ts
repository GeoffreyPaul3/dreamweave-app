import { AmazonOrder } from '@/integrations/amazon-uae/types';
import { supabase } from '@/integrations/supabase/client';

export class AmazonNotificationService {
  private static instance: AmazonNotificationService;

  static getInstance(): AmazonNotificationService {
    if (!AmazonNotificationService.instance) {
      AmazonNotificationService.instance = new AmazonNotificationService();
    }
    return AmazonNotificationService.instance;
  }

  async sendOrderConfirmation(order: AmazonOrder, userEmail?: string): Promise<void> {
    try {
      if (!userEmail) {
        console.warn('No email provided for order confirmation');
        return;
      }

      // Get the user's JWT for the Authorization header
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;

      const EMAIL_FUNCTION_URL = import.meta.env.VITE_EMAIL_FUNCTION_URL || 'http://localhost:54321/functions/v1';

      const response = await fetch(`${EMAIL_FUNCTION_URL}/amazon-notifications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          event: 'order_confirmation',
          userEmail: userEmail,
          order: order
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Order confirmation email sent for order ${order.order_number} to ${userEmail}`);
      } else {
        console.error('Failed to send order confirmation email:', result.error);
      }
    } catch (error) {
      console.error('Error sending order confirmation:', error);
    }
  }

  async sendOrderStatusUpdate(order: AmazonOrder, newStatus: string, userEmail?: string): Promise<void> {
    try {
      if (!userEmail) {
        console.warn('No email provided for order status update');
        return;
      }

      // Get the user's JWT for the Authorization header
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;

      const EMAIL_FUNCTION_URL = import.meta.env.VITE_EMAIL_FUNCTION_URL || 'http://localhost:54321/functions/v1';

      const response = await fetch(`${EMAIL_FUNCTION_URL}/amazon-notifications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          event: 'order_status_update',
          userEmail: userEmail,
          order: order,
          newStatus: newStatus
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Order status update email sent for order ${order.order_number}: ${newStatus} to ${userEmail}`);
      } else {
        console.error('Failed to send order status update email:', result.error);
      }
    } catch (error) {
      console.error('Error sending status update:', error);
    }
  }

  async sendDeliveryNotification(order: AmazonOrder, userEmail?: string): Promise<void> {
    try {
      if (!userEmail) {
        console.warn('No email provided for delivery notification');
        return;
      }

      // Get the user's JWT for the Authorization header
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;

      const EMAIL_FUNCTION_URL = import.meta.env.VITE_EMAIL_FUNCTION_URL || 'http://localhost:54321/functions/v1';

      const response = await fetch(`${EMAIL_FUNCTION_URL}/amazon-notifications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          event: 'order_delivered',
          userEmail: userEmail,
          order: order
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Delivery notification email sent for order ${order.order_number} to ${userEmail}`);
      } else {
        console.error('Failed to send delivery notification email:', result.error);
      }
    } catch (error) {
      console.error('Error sending delivery notification:', error);
    }
  }
}

export const amazonNotificationService = AmazonNotificationService.getInstance();
