import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { rapidAPIAmazonService } from '@/integrations/amazon-uae/rapidapi-service';

const RequestOrderPaymentCallback = () => {
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
          console.log('Payment verified successfully for tx_ref:', tx_ref);
          
          // Get the request order from the payment reference
          const { data: orderData, error: orderError } = await supabase
            .from('request_orders')
            .select('*')
            .eq('paychangu_reference', tx_ref)
            .single();

          if (orderError) {
            console.error('Error fetching request order by payment reference:', orderError);
            throw orderError;
          }

          if (orderData) {
            console.log('Request order found:', orderData.id, orderData.item_name);
            
            // Determine payment type from the transaction reference
            const paymentTypeMatch = tx_ref.match(/REQUEST_.+?_(deposit|full)_/);
            const paymentType = paymentTypeMatch ? paymentTypeMatch[1] : 'deposit';
            
            if (paymentType === 'deposit') {
              // Update order status to deposit paid
              const success = await rapidAPIAmazonService.updateRequestOrderDeposit(
                orderData.id,
                true,
                tx_ref
              );

              if (success) {
                toast({
                  title: "Deposit Payment Successful",
                  description: "Your deposit has been processed successfully. Your order will be processed soon.",
                });
              } else {
                throw new Error('Failed to update order deposit status');
              }
            } else {
              // Update order status to delivered for final payment
              const success = await rapidAPIAmazonService.updateRequestOrderStatus(
                orderData.id,
                'delivered',
                orderData.admin_price,
                orderData.admin_notes
              );

              if (success) {
                toast({
                  title: "Final Payment Successful",
                  description: "Your order has been fully paid and marked as delivered.",
                });
              } else {
                throw new Error('Failed to update order status');
              }
            }

            // Redirect to the pay requested orders page
            navigate('/pay-requested-orders');
          } else {
            throw new Error('Request order not found');
          }
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Request order payment verification error:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to verify payment",
          variant: "destructive"
        });
        navigate('/pay-requested-orders');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your payment...
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Verified
              </h2>
              <p className="text-gray-600 mb-4">
                Your payment has been successfully processed.
              </p>
              <button
                onClick={() => navigate('/pay-requested-orders')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Your Orders
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestOrderPaymentCallback;
