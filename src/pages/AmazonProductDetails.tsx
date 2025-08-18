import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Truck, Shield, Clock, ShoppingCart, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { rapidAPIAmazonService } from '@/integrations/amazon-uae/rapidapi-service';
import { AmazonProduct, ProductReview } from '@/integrations/amazon-uae/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AmazonProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<AmazonProduct | null>(null);
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
      // Get all products and find the one with matching ID
      const allProducts = await rapidAPIAmazonService.fetchProducts();
      const productData = allProducts.find(p => p.id === id);
      
      if (!productData) {
        throw new Error('Product not found');
      }
      
      setProduct(productData);
      setReviews([]); // Reviews not implemented in rapidAPI service yet
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

    navigate('/amazon/checkout', {
      state: {
        product,
        quantity,
        totalAmount
      }
    });
  };

  const handleSubmitReview = async () => {
    if (!user || !product) return;

    try {
      // TODO: Implement review functionality with rapidAPI service
      console.log('Review submission:', {
        product_id: product.id,
        user_id: user.id,
        rating: reviewRating,
        comment: reviewComment
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });

      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      fetchProductDetails(); // Refresh reviews
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
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
            <h2 className="text-2xl font-semibold text-gray-600">Product not found</h2>
            <Button onClick={() => navigate('/amazon')} className="mt-4">
              Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;
  const totalWithShipping = totalPrice + product.shipping_cost;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-white">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-2 mb-4">
                {renderStars(product.rating, 'lg')}
                <span className="text-lg font-semibold">{product.rating}</span>
                <span className="text-gray-600">({product.review_count} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-3xl font-bold text-green-600">
                MWK {product.price.toLocaleString()}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>Shipping: MWK {product.shipping_cost.toLocaleString()}</div>
                <div className="font-semibold text-lg">
                  Total: MWK {totalWithShipping.toLocaleString()}
                </div>
              </div>
              
              {/* Show size and color for fashion products */}
              {product.category === 'Fashion' && (product.size || product.color) && (
                <div className="flex flex-wrap gap-2">
                  {product.size && (
                    <Badge variant="secondary" className="text-sm">
                      Size: {product.size}
                    </Badge>
                  )}
                  {product.color && (
                    <Badge variant="secondary" className="text-sm">
                      Color: {product.color}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Delivery Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Delivery Information</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Delivery period: 10-15 days</div>
                <div>• Minimum order: MWK 250,000</div>
                <div>• Maximum order: MWK 20,000,000</div>
              </div>
            </div>

            <Separator />

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Quantity:</label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-32">
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

              <div className="flex gap-4">
                <Button 
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buy Now
                </Button>
              </div>
            </div>

            <Separator />

            {/* Product Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            {user && (
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                Write a Review
              </Button>
            )}
          </div>

          {showReviewForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Rating:</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        {renderStars(star, 'lg')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Comment:</label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating, 'sm')}
                    <span className="font-semibold">{review.rating}/5</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}

            {reviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review this product!
              </div>
            )}
          </div>
                 </div>
       </div>
       <Footer />
     </div>
   );
 };

export default AmazonProductDetails;
