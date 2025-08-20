import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RequestOrder } from '@/integrations/amazon-uae/types';

interface RequestOrderPayChanguPaymentProps {
  order: RequestOrder;
  paymentType: 'deposit' | 'full';
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

const RequestOrderPayChanguPayment = ({ order, paymentType, onSuccess, onCancel }: RequestOrderPayChanguPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const initiatePayment = async () => {
    try {
      setIsLoading(true);

      const amount = paymentType === 'deposit' 
        ? (order.admin_price || 0) * 0.5 
        : (order.admin_price || 0) * 0.5; // Remaining balance

      // Generate a unique transaction reference for request order
      const tx_ref = `REQUEST_${order.id}_${paymentType}_${Date.now()}`;

      // Update request order with payment reference
      const { error: orderError } = await supabase
        .from('request_orders')
        .update({
          paychangu_reference: tx_ref,
          status: paymentType === 'deposit' ? 'payment_pending' : 'final_payment_pending'
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
          amount: amount,
          currency: 'MWK',
          email: user?.email,
          first_name: user?.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          callback_url: `${window.location.origin}/request-order/payment-callback`,
          return_url: `${window.location.origin}/pay-requested-orders`,
          tx_ref: tx_ref,
          customization: {
            title: `Dream Weave Dubai Request Order ${paymentType === 'deposit' ? 'Deposit' : 'Final'} Payment`,
            description: `${paymentType === 'deposit' ? 'Deposit' : 'Final'} payment for ${order.item_name}`,
          },
          meta: {
            order_id: order.id,
            payment_type: paymentType,
            user_id: user?.id,
            item_name: order.item_name
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
      console.error('Request order payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process request order payment",
        variant: "destructive"
      });
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  const amount = paymentType === 'deposit' 
    ? (order.admin_price || 0) * 0.5 
    : (order.admin_price || 0) * 0.5;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Dream Weave Dubai Request Order {paymentType === 'deposit' ? 'Deposit' : 'Final'} Payment
        </h3>
        <p className="text-gray-600 mb-4">
          Item: {order.item_name}
        </p>
        <p className="text-gray-600 mb-4">
          Please complete the {paymentType === 'deposit' ? 'deposit' : 'final'} payment of MWK {amount.toLocaleString()} to proceed with your request order.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-sm">
          <div className="flex justify-between mb-2">
            <span>Total Price:</span>
            <span>MWK {order.admin_price?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>{paymentType === 'deposit' ? 'Deposit Amount (50%):' : 'Remaining Balance (50%):'}</span>
            <span>MWK {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Amount to Pay:</span>
            <span>MWK {amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          className="flex-1"
          onClick={initiatePayment}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : `Pay ${paymentType === 'deposit' ? 'Deposit' : 'Final Amount'}`}
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

export default RequestOrderPayChanguPayment;
