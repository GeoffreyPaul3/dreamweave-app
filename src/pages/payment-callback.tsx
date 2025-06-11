<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const tx_ref = searchParams.get('tx_ref');

        if (!tx_ref) {
          throw new Error('No transaction reference found');
        }

        // Verify payment with PayChangu
        const response = await fetch(`https://api.paychangu.com/verify-payment/${tx_ref}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_PAYCHANGU_SECRET_KEY}`
          }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data.status === 'success') {
          // Update payment record in database
          const { error: updateError } = await supabase
            .from('listing_payments')
            .update({
              payment_status: 'completed',
              payment_verified_at: new Date().toISOString()
            })
            .eq('paychangu_reference', tx_ref);

          if (updateError) throw updateError;

          // Get the listing ID from the payment record
          const { data: paymentData, error: paymentError } = await supabase
            .from('listing_payments')
            .select('listing_id')
            .eq('paychangu_reference', tx_ref)
            .single();

          if (paymentError) throw paymentError;

          // Update listing status to active
          if (paymentData?.listing_id) {
            const { error: listingError } = await supabase
              .from('listings')
              .update({ status: 'active' })
              .eq('id', paymentData.listing_id);

            if (listingError) throw listingError;
          }

          toast({
            title: "Payment Successful",
            description: "Your listing has been activated successfully",
          });

          // Redirect to the listing page or dashboard
          navigate(paymentData?.listing_id ? `/listing/${paymentData.listing_id}` : '/dashboard');
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to verify payment",
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {isVerifying ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your payment...</p>
          </>
        ) : (
          <p className="text-gray-600">Redirecting...</p>
        )}
      </div>
    </div>
  );
};

=======
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const tx_ref = searchParams.get('tx_ref');

        if (!tx_ref) {
          throw new Error('No transaction reference found');
        }

        // Verify payment with PayChangu
        const response = await fetch(`https://api.paychangu.com/verify-payment/${tx_ref}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_PAYCHANGU_SECRET_KEY}`
          }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data.status === 'success') {
          // Update payment record in database
          const { error: updateError } = await supabase
            .from('listing_payments')
            .update({
              payment_status: 'completed',
              payment_verified_at: new Date().toISOString()
            })
            .eq('paychangu_reference', tx_ref);

          if (updateError) throw updateError;

          // Get the listing ID from the payment record
          const { data: paymentData, error: paymentError } = await supabase
            .from('listing_payments')
            .select('listing_id')
            .eq('paychangu_reference', tx_ref)
            .single();

          if (paymentError) throw paymentError;

          // Update listing status to active
          if (paymentData?.listing_id) {
            const { error: listingError } = await supabase
              .from('listings')
              .update({ status: 'active' })
              .eq('id', paymentData.listing_id);

            if (listingError) throw listingError;
          }

          toast({
            title: "Payment Successful",
            description: "Your listing has been activated successfully",
          });

          // Redirect to the listing page or dashboard
          navigate(paymentData?.listing_id ? `/listing/${paymentData.listing_id}` : '/dashboard');
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to verify payment",
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {isVerifying ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your payment...</p>
          </>
        ) : (
          <p className="text-gray-600">Redirecting...</p>
        )}
      </div>
    </div>
  );
};

>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
export default PaymentCallback; 