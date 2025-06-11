<<<<<<< HEAD

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, listingId, amount, onPaymentSuccess }: PaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user) return;

    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      // Create payment record
      const paymentReference = `DW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: paymentError } = await supabase
        .from('listing_payments')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          amount: amount,
          paychangu_reference: paymentReference,
          payment_status: 'pending'
        });

      if (paymentError) throw paymentError;

      // Update listing with payment reference
      const { error: listingError } = await supabase
        .from('listings')
        .update({
          status: 'payment_pending',
          paychangu_reference: paymentReference,
          payment_amount: amount
        })
        .eq('id', listingId);

      if (listingError) throw listingError;

      toast({
        title: "Payment Initiated",
        description: `Payment request sent to ${phoneNumber}. Please complete the payment on your phone.`
      });

      // Simulate payment verification (in real app, this would be webhook from PayChangu)
      setTimeout(async () => {
        const { error: verifyError } = await supabase
          .from('listing_payments')
          .update({
            payment_status: 'completed',
            payment_verified_at: new Date().toISOString()
          })
          .eq('paychangu_reference', paymentReference);

        if (!verifyError) {
          await supabase
            .from('listings')
            .update({
              status: 'pending_approval',
              payment_verified: true
            })
            .eq('id', listingId);

          toast({
            title: "Payment Successful",
            description: "Your listing is now pending admin approval!"
          });
          onPaymentSuccess();
        }
      }, 3000); // Simulate 3 second payment processing

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Payment Details</h3>
            <p className="text-blue-800">Listing Fee: MWK {amount.toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-2">
              10% commission fee for marketplace services
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Money Number</Label>
            <Input
              id="phone"
              placeholder="e.g. +265991234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              You will receive a mobile money prompt on your phone to complete the payment.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={processing}
              className="flex-1"
            >
              {processing ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
=======

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, listingId, amount, onPaymentSuccess }: PaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user) return;

    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      // Create payment record
      const paymentReference = `DW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: paymentError } = await supabase
        .from('listing_payments')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          amount: amount,
          paychangu_reference: paymentReference,
          payment_status: 'pending'
        });

      if (paymentError) throw paymentError;

      // Update listing with payment reference
      const { error: listingError } = await supabase
        .from('listings')
        .update({
          status: 'payment_pending',
          paychangu_reference: paymentReference,
          payment_amount: amount
        })
        .eq('id', listingId);

      if (listingError) throw listingError;

      toast({
        title: "Payment Initiated",
        description: `Payment request sent to ${phoneNumber}. Please complete the payment on your phone.`
      });

      // Simulate payment verification (in real app, this would be webhook from PayChangu)
      setTimeout(async () => {
        const { error: verifyError } = await supabase
          .from('listing_payments')
          .update({
            payment_status: 'completed',
            payment_verified_at: new Date().toISOString()
          })
          .eq('paychangu_reference', paymentReference);

        if (!verifyError) {
          await supabase
            .from('listings')
            .update({
              status: 'pending_approval',
              payment_verified: true
            })
            .eq('id', listingId);

          toast({
            title: "Payment Successful",
            description: "Your listing is now pending admin approval!"
          });
          onPaymentSuccess();
        }
      }, 3000); // Simulate 3 second payment processing

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Payment Details</h3>
            <p className="text-blue-800">Listing Fee: MWK {amount.toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-2">
              10% commission fee for marketplace services
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Money Number</Label>
            <Input
              id="phone"
              placeholder="e.g. +265991234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              You will receive a mobile money prompt on your phone to complete the payment.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={processing}
              className="flex-1"
            >
              {processing ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
