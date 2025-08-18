import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AmazonOrder } from '@/integrations/amazon-uae/types';

interface AmazonPayChanguPaymentProps {
  order: AmazonOrder;
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

const AmazonPayChanguPayment = ({ order, onSuccess, onCancel }: AmazonPayChanguPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const initiatePayment = async () => {
    try {
      setIsLoading(true);

      // Generate a unique transaction reference for Amazon order
      const tx_ref = `AMAZON_${order.order_number}_${Date.now()}`;

      // Update order with payment reference
      const { error: orderError } = await supabase
        .from('amazon_orders')
        .update({
          paychangu_reference: tx_ref,
          status: 'payment_pending'
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Initiate PayChangu payment
      const response = await fetch('https://api.paychangu.com/payment', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PAYCHANGU_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: order.total_amount,
          currency: 'MWK',
          email: user?.email,
          first_name: order.delivery_address.full_name.split(' ')[0] || '',
          last_name: order.delivery_address.full_name.split(' ').slice(1).join(' ') || '',
          callback_url: `${window.location.origin}/amazon/payment-callback`,
          return_url: `${window.location.origin}/amazon/checkout`,
          tx_ref: tx_ref,
          customization: {
            title: "Dream Weave Dubai Order Payment",
            description: `Payment for ${order.order_number}`,
          },
          meta: {
            order_id: order.id,
            order_number: order.order_number,
            user_id: user?.id,
            product_id: order.product_id
          }
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Redirect to PayChangu checkout
        window.location.href = data.data.checkout_url;
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Amazon payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process Amazon order payment",
        variant: "destructive"
      });
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
                     <h3 className="text-lg font-semibold mb-2">Dream Weave Dubai Order Payment</h3>
        <p className="text-gray-600 mb-4">
          Order: {order.order_number}
        </p>
        <p className="text-gray-600 mb-4">
          Please complete the payment of MWK {order.total_amount.toLocaleString()} to proceed with your Amazon order.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-sm">
          <div className="flex justify-between mb-2">
            <span>Product Price:</span>
            <span>MWK {order.product_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping Cost:</span>
            <span>MWK {order.shipping_cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total:</span>
            <span>MWK {order.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          className="flex-1"
          onClick={initiatePayment}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AmazonPayChanguPayment;
