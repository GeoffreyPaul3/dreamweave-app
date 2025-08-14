import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Truck, Shield, CreditCard, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { amazonUAEService } from '@/integrations/amazon-uae/service';
import { AmazonProduct, AmazonOrder } from '@/integrations/amazon-uae/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AmazonPayChanguPayment from '@/components/AmazonPayChanguPayment';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const AmazonCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<AmazonProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<AmazonOrder | null>(null);
  const [isCartCheckout, setIsCartCheckout] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  useEffect(() => {
    if (location.state) {
      // Check if it's a cart checkout
      if (location.state.cartItems) {
        setIsCartCheckout(true);
        setCartItems(location.state.cartItems);
        // For now, we'll handle cart checkout by taking the first item
        // In a full implementation, you'd want to create multiple orders or a single order with multiple items
        const firstItem = location.state.cartItems[0];
        setProduct(firstItem.product);
        setQuantity(firstItem.quantity);
        setTotalAmount(location.state.total);
        return;
      }
      
      // Handle single product checkout
      const { product: productData, quantity: qty, totalAmount: total } = location.state;
      setProduct(productData);
      setQuantity(qty);
      setTotalAmount(total);
    } else {
      navigate('/amazon');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (user) {
      setValue('email', user.email || '');
      setValue('fullName', user.user_metadata?.full_name || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user || !product) return;

    setLoading(true);
    try {
      // Validate order amount
      if (!amazonUAEService.validateOrderAmount(totalAmount)) {
        toast({
          title: "Invalid Order Amount",
          description: "Order amount must be between MWK 250,000 and MWK 20,000,000",
          variant: "destructive"
        });
        return;
      }

      // Create order
      const order = await amazonUAEService.createOrder({
        user_id: user.id,
        product_id: product.id,
        quantity: quantity,
        product_price: product.price,
        shipping_cost: product.shipping_cost,
        total_amount: totalAmount,
        delivery_address: {
          full_name: data.fullName,
          phone: data.phone,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2,
          city: data.city,
          postal_code: data.postalCode,
          country: data.country,
        }
      });

      if (order) {
        setCreatedOrder(order);
        setShowPaymentDialog(true);
        toast({
          title: "Order Created Successfully!",
          description: `Order number: ${order.order_number}. Please complete payment to proceed.`,
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    setShowPaymentDialog(false);
    navigate('/amazon/order-success', {
      state: { orderId: orderId }
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setCreatedOrder(null);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-600">No product selected</h2>
            <Button onClick={() => navigate('/amazon')} className="mt-4">
              Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
                             <Card>
                 <CardHeader>
                   <CardTitle>
                     {isCartCheckout ? `Cart Summary (${cartItems.length} items)` : 'Order Summary'}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {isCartCheckout ? (
                     <>
                       {/* Show cart items */}
                       <div className="space-y-3">
                         {cartItems.map((item, index) => (
                           <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                             <div className="w-16 h-16 overflow-hidden rounded-lg">
                               <img
                                 src={item.product.image_url}
                                 alt={item.product.title}
                                 className="w-full h-full object-cover"
                               />
                             </div>
                             <div className="flex-1">
                               <h4 className="font-medium text-sm">{item.product.title}</h4>
                               <p className="text-xs text-gray-600">{item.product.brand}</p>
                               <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                             </div>
                             <div className="text-right">
                               <p className="font-medium text-sm">
                                 MWK {(item.product.price * item.quantity + item.product.shipping_cost * item.quantity).toLocaleString()}
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                       
                       <Separator />
                       
                       <div className="space-y-2">
                         <div className="flex justify-between">
                           <span>Subtotal:</span>
                           <span>MWK {location.state.subtotal?.toLocaleString() || '0'}</span>
                         </div>
                         <div className="flex justify-between">
                           <span>Shipping:</span>
                           <span>MWK {location.state.shippingTotal?.toLocaleString() || '0'}</span>
                         </div>
                         <Separator />
                         <div className="flex justify-between font-bold text-lg">
                           <span>Total:</span>
                           <span className="text-green-600">MWK {totalAmount.toLocaleString()}</span>
                         </div>
                       </div>
                     </>
                   ) : (
                     <>
                       {/* Show single product */}
                       <div className="flex items-center gap-4">
                         <div className="w-20 h-20 overflow-hidden rounded-lg">
                           <img
                             src={product.image_url}
                             alt={product.title}
                             className="w-full h-full object-cover"
                           />
                         </div>
                         <div className="flex-1">
                           <h3 className="font-semibold">{product.title}</h3>
                           <p className="text-sm text-gray-600">{product.brand}</p>
                           <p className="text-sm text-gray-600">Qty: {quantity}</p>
                         </div>
                       </div>
                       
                       <Separator />
                       
                       <div className="space-y-2">
                         <div className="flex justify-between">
                           <span>Product Price:</span>
                           <span>MWK {(product.price * quantity).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between">
                           <span>Shipping:</span>
                           <span>MWK {product.shipping_cost.toLocaleString()}</span>
                         </div>
                         <Separator />
                         <div className="flex justify-between font-bold text-lg">
                           <span>Total:</span>
                           <span className="text-green-600">MWK {totalAmount.toLocaleString()}</span>
                         </div>
                       </div>
                     </>
                   )}
                 </CardContent>
               </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Delivery period: 10-15 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Delivery to your address</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <p className="text-sm text-gray-600">
                  Please provide your contact information and delivery address
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Information
                    </h3>
                    
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        {...register('fullName')}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="e.g. +265991234567"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Delivery Address */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </h3>
                    
                    <div>
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        {...register('addressLine1')}
                        placeholder="Street address, P.O. box, company name"
                      />
                      {errors.addressLine1 && (
                        <p className="text-red-500 text-sm mt-1">{errors.addressLine1.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                      <Input
                        id="addressLine2"
                        {...register('addressLine2')}
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...register('city')}
                          placeholder="City"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          {...register('postalCode')}
                          placeholder="Postal code"
                        />
                        {errors.postalCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        {...register('country')}
                        placeholder="Country"
                        defaultValue="Malawi"
                      />
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Order Amount Validation */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Order Requirements</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• Minimum order: MWK 250,000</div>
                      <div>• Maximum order: MWK 20,000,000</div>
                      <div>• Your order: MWK {totalAmount.toLocaleString()}</div>
                    </div>
                    {!amazonUAEService.validateOrderAmount(totalAmount) && (
                      <div className="mt-2 text-red-600 text-sm">
                        ⚠️ Order amount is outside the allowed range
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !amazonUAEService.validateOrderAmount(totalAmount)}
                  >
                    {loading ? 'Processing...' : `Place Order - MWK ${totalAmount.toLocaleString()}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          {createdOrder && (
            <AmazonPayChanguPayment
              order={createdOrder}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default AmazonCheckout;
