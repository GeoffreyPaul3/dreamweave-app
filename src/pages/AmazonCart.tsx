import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAmazonCart } from '@/contexts/AmazonCartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AmazonCart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { state, removeItem, updateQuantity, clearCart } = useAmazonCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    setIsUpdating(productId);
    try {
      updateQuantity(productId, newQuantity);
      toast({
        title: "Cart Updated",
        description: "Item quantity has been updated",
      });
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Failed to update item quantity",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast({
      title: "Item Removed",
      description: `${productName} has been removed from cart`,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from cart",
    });
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (state.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    // Validate order amount
    if (state.total < 250000 || state.total > 20000000) {
      toast({
        title: "Invalid Order Amount",
        description: "Order amount must be between MWK 250,000 and MWK 20,000,000",
        variant: "destructive"
      });
      return;
    }

    navigate('/amazon/checkout', {
      state: { 
        cartItems: state.items,
        subtotal: state.subtotal,
        shippingTotal: state.shippingTotal,
        total: state.total
      }
    });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <Header />
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Your Cart is Empty
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed px-4">
              Looks like you haven't added any items to your cart yet.
              <br className="hidden sm:block" />
              Start exploring our amazing products!
            </p>
            <Button 
              onClick={() => navigate('/amazon')} 
              className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/amazon')}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 hover:bg-primary/10 rounded-lg sm:rounded-xl transition-all duration-200 w-fit"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Shopping Cart
                </h1>
                <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-primary/10 text-primary border-0 w-fit">
                  {state.totalItems} {state.totalItems === 1 ? 'item' : 'items'}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl transition-all duration-200 w-fit"
            >
              Clear Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {state.items.map((item, index) => (
                <Card key={item.product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 md:w-32 h-24 sm:h-24 md:h-32 flex-shrink-0 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-md mx-auto sm:mx-0">
                        <img
                          src={item.product.image_url}
                          alt={item.product.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg sm:text-xl mb-2 break-words text-gray-900 hover:text-primary transition-colors duration-200">
                              {item.product.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 font-medium break-words">{item.product.brand}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <Badge variant="outline" className="px-2 sm:px-3 py-1 bg-primary/10 text-primary border-primary/20 w-fit">
                            {item.product.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-sm sm:text-lg ${i < Math.floor(item.product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{item.product.rating}</span>
                            <span className="text-xs sm:text-sm text-gray-500">({item.product.review_count} reviews)</span>
                          </div>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <p className="text-xl sm:text-2xl font-bold text-green-600">
                                MWK {item.product.price.toLocaleString()}
                              </p>
                              <Badge className="bg-green-100 text-green-800 border-0 px-2 py-1 text-xs sm:text-sm w-fit">
                                Save 15%
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">
                              Shipping: MWK {item.product.shipping_cost.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                disabled={isUpdating === item.product.id || item.quantity <= 1}
                                className="h-8 sm:h-10 w-8 sm:w-10 p-0 hover:bg-gray-100 transition-colors duration-200"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <span className="px-3 sm:px-4 py-1 sm:py-2 min-w-[40px] sm:min-w-[50px] text-center font-semibold text-base sm:text-lg bg-white">
                                {isUpdating === item.product.id ? '...' : item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                disabled={isUpdating === item.product.id}
                                className="h-8 sm:h-10 w-8 sm:w-10 p-0 hover:bg-gray-100 transition-colors duration-200"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.product.id, item.product.title)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 sm:h-10 w-8 sm:w-10 p-0 rounded-lg sm:rounded-xl transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">Item Total:</span>
                            <p className="text-lg sm:text-xl font-bold text-primary">
                              MWK {(item.product.price * item.quantity + item.product.shipping_cost * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-xl">
                  <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium text-sm sm:text-base">Subtotal ({state.totalItems} items)</span>
                      <span className="font-semibold text-base sm:text-lg">MWK {state.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium text-sm sm:text-base">Shipping</span>
                      <span className="font-semibold text-base sm:text-lg">MWK {state.shippingTotal.toLocaleString()}</span>
                    </div>
                    <Separator className="bg-gray-200" />
                    <div className="flex justify-between items-center py-3 bg-gradient-to-r from-green-50 to-primary/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-green-600">MWK {state.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Order Requirements */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-primary/20">
                    <h4 className="font-bold text-primary mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Order Requirements
                    </h4>
                    <div className="text-xs sm:text-sm text-primary/80 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Minimum order: MWK 250,000
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Maximum order: MWK 20,000,000
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Delivery: 10-15 days
                      </div>
                    </div>
                    {state.total < 250000 && (
                      <div className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-xs sm:text-sm font-medium">
                        ⚠️ Order amount is below minimum requirement
                      </div>
                    )}
                    {state.total > 20000000 && (
                      <div className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-xs sm:text-sm font-medium">
                        ⚠️ Order amount exceeds maximum limit
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                    size="lg"
                    disabled={state.total < 250000 || state.total > 20000000}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AmazonCart;
