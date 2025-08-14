import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { amazonUAEService } from '@/integrations/amazon-uae/service';
import { useAmazonCart } from '@/contexts/AmazonCartContext';

const AmazonPaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { clearCart } = useAmazonCart();
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
          
          // Get the order from the payment reference
          const { data: orderData, error: orderError } = await supabase
            .from('amazon_orders')
            .select('*')
            .eq('paychangu_reference', tx_ref)
            .single();

          if (orderError) {
            console.error('Error fetching order by payment reference:', orderError);
            throw orderError;
          }

          if (orderData) {
            console.log('Order found:', orderData.id, orderData.order_number);
            // Update order status to processing
            const success = await amazonUAEService.updateOrderStatus(
              orderData.id,
              'processing',
              'Payment verified successfully'
            );

            if (success) {
              // Add tracking update
              await amazonUAEService.addTrackingUpdate({
                order_id: orderData.id,
                status: 'Payment Confirmed',
                description: 'Payment has been verified and order is being processed',
                timestamp: new Date().toISOString()
              });

              // Clear the cart after successful payment
              clearCart();

              toast({
                title: "Payment Successful",
                description: `Your Amazon order ${orderData.order_number} has been confirmed and is being processed`,
              });

              console.log('Redirecting to order success with orderId:', orderData.id);
              // Redirect to order success page with state
              navigate('/amazon/order-success', {
                state: { 
                  orderId: orderData.id,
                  orderNumber: orderData.order_number
                }
              });
            } else {
              throw new Error('Failed to update order status');
            }
          } else {
            throw new Error('Order not found');
          }
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Amazon payment verification error:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to verify Amazon order payment",
          variant: "destructive"
        });
        navigate('/amazon/checkout');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {isVerifying ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your Amazon order payment...</p>
          </>
        ) : (
          <p className="text-gray-600">Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default AmazonPaymentCallback;
