<<<<<<< HEAD
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PayChanguPaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  listingId?: string;
}

const PayChanguPayment = ({ amount, onSuccess, onCancel, listingId }: PayChanguPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const initiatePayment = async () => {
    try {
      setIsLoading(true);

      // Generate a unique transaction reference
      const tx_ref = `LISTING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create payment record in database
      const { error: paymentError } = await supabase
        .from('listing_payments')
        .insert({
          listing_id: listingId,
          user_id: user?.id,
          amount: amount,
          paychangu_reference: tx_ref,
          payment_status: 'pending'
        });

      if (paymentError) throw paymentError;

      // Update listing with payment reference
      const { error: listingError } = await supabase
        .from('listings')
        .update({
          status: 'payment_pending',
          paychangu_reference: tx_ref,
          payment_amount: amount
        })
        .eq('id', listingId);

      if (listingError) throw listingError;

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
          callback_url: `${window.location.origin}/payment-callback`,
          return_url: `${window.location.origin}/payment-cancel`,
          tx_ref: tx_ref,
          customization: {
            title: "Listing Commission Payment",
            description: "Payment for listing commission",
          },
          meta: {
            listing_id: listingId,
            user_id: user?.id
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
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
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
        <h3 className="text-lg font-semibold mb-2">Listing Commission Payment</h3>
        <p className="text-gray-600 mb-4">
          Please complete the payment of MWK {amount.toLocaleString()} to proceed with your listing.
        </p>
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

=======
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PayChanguPaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  listingId?: string;
}

const PayChanguPayment = ({ amount, onSuccess, onCancel, listingId }: PayChanguPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const initiatePayment = async () => {
    try {
      setIsLoading(true);

      // Generate a unique transaction reference
      const tx_ref = `LISTING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create payment record in database
      const { error: paymentError } = await supabase
        .from('listing_payments')
        .insert({
          listing_id: listingId,
          user_id: user?.id,
          amount: amount,
          paychangu_reference: tx_ref,
          payment_status: 'pending'
        });

      if (paymentError) throw paymentError;

      // Update listing with payment reference
      const { error: listingError } = await supabase
        .from('listings')
        .update({
          status: 'payment_pending',
          paychangu_reference: tx_ref,
          payment_amount: amount
        })
        .eq('id', listingId);

      if (listingError) throw listingError;

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
          callback_url: `${window.location.origin}/payment-callback`,
          return_url: `${window.location.origin}/payment-cancel`,
          tx_ref: tx_ref,
          customization: {
            title: "Listing Commission Payment",
            description: "Payment for listing commission",
          },
          meta: {
            listing_id: listingId,
            user_id: user?.id
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
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
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
        <h3 className="text-lg font-semibold mb-2">Listing Commission Payment</h3>
        <p className="text-gray-600 mb-4">
          Please complete the payment of MWK {amount.toLocaleString()} to proceed with your listing.
        </p>
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

>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
export default PayChanguPayment; 