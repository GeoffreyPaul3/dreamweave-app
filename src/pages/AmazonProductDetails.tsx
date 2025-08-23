import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Truck, Shield, Clock, ShoppingCart, Heart, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { combinedStoreService, CombinedProduct } from '@/integrations/combined-store/service';
import { ProductReview } from '@/integrations/amazon-uae/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AmazonProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<CombinedProduct | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchProductDetails = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Use combined service to get product details
      const productData = await combinedStoreService.getProductDetails(id);
      
      if (!productData) {
        throw new Error('Product not found');
      }
      
      setProduct(productData);
      setReviews([]); // Reviews not implemented yet
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id, fetchProductDetails]);

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: Implement cart functionality
    toast({
      title: "Added to Cart",
      description: `${product?.title} has been added to your cart`,
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = (product?.price || 0) * quantity + (product?.shipping_cost || 0);
    
    if (totalAmount < 250000 || totalAmount > 20000000) {
      toast({
        title: "Invalid Order Amount",
        description: "Order amount must be between MWK 250,000 and MWK 20,000,000",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement buy now functionality
    toast({
      title: "Buy Now",
      description: "Redirecting to checkout...",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/amazon')}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {/* Source badge */}
              <Badge 
                variant="secondary" 
                className="absolute top-4 right-4 bg-white/90 text-gray-700"
              >
                <Tag className="w-4 h-4 mr-1" />
                {product.source === 'shein' ? 'Shein' : 'Amazon'}
              </Badge>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                {renderStars(product.rating)}
                <span className="text-gray-600">({product.review_count} reviews)</span>
              </div>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            <Separator />

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  MWK {product.price.toLocaleString()}
                </span>
                {product.source === 'shein' && (
                  <span className="text-sm text-gray-500 line-through">
                    MWK {(product.price * 1.2).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-gray-600">
                Shipping: MWK {product.shipping_cost.toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                Total: MWK {(product.price + product.shipping_cost).toLocaleString()}
              </div>
            </div>

            <Separator />

            {/* Product Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size and Color for Fashion Products */}
              {product.category === 'Fashion' && (product.size || product.color) && (
                <div className="space-y-3">
                  {product.size && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Size: </span>
                      <Badge variant="outline">{product.size}</Badge>
                    </div>
                  )}
                  {product.color && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Color: </span>
                      <Badge variant="outline">{product.color}</Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow}
                variant="default"
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Buy Now
              </Button>
            </div>

            {/* Product Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="text-sm">10-15 days delivery to Malawi</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Secure payment with PayChangu</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm">Order tracking available</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              {user && (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="mt-4"
                >
                  Write a Review
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AmazonProductDetails;
