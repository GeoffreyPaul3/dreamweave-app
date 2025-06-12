import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MapPin, Star, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ListingChat from '@/components/messaging/ListingChat';
import Header from '@/components/Header';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  featured_image: string | null;
  images: string[] | null;
  seller_id: string;
  created_at: string | null;
  location: string | null;
  condition: string | null;
  views: number | null;
  likes: number | null;
  status: 'draft' | 'payment_pending' | 'pending_approval' | 'active' | 'sold' | 'suspended' | 'rejected' | null;
  category_id: string;
  category: {
    name: string;
  };
  profiles: {
    id: string;
    full_name: string;
    rating: number;
    total_reviews: number;
    phone: string | null;
    avatar_url: string;
  };
  favorites: Array<{ user_id: string }>;
}

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            profiles:seller_id (
              id,
              full_name,
              rating,
              total_reviews,
              phone,
              avatar_url
            ),
            category:category_id (
              name
            ),
            favorites (
              user_id
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Check if there's a pending payment
        if (data.status === 'payment_pending') {
          const { data: paymentData } = await supabase
            .from('listing_payments')
            .select('paychangu_reference')
            .eq('listing_id', id)
            .eq('payment_status', 'pending')
            .single();

          if (paymentData?.paychangu_reference) {
            setIsPaymentPending(true);
          }
        }

        setListing(data);
        
        // Check if user has favorited this listing
        if (user && data.favorites) {
          setIsFavorited(data.favorites.some(fav => fav.user_id === user.id));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to save favorites.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing?.id);
        
        if (error) throw error;
        setIsFavorited(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listing?.id
          });
        
        if (error) throw error;
        setIsFavorited(true);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `MWK ${price.toLocaleString()}`;
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
    return imagePath;
  };

  const handlePreviousImage = () => {
    if (!listing?.images?.length) return;
    setSelectedImageIndex((prev) => (prev === 0 ? listing.images!.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!listing?.images?.length) return;
    setSelectedImageIndex((prev) => (prev === listing.images!.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Listing not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={getImageUrl(listing.images?.[selectedImageIndex] || listing.featured_image || '')}
                alt={listing.title}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
                onLoad={() => setIsImageLoading(false)}
              />
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
              {listing.images && listing.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handlePreviousImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{listing.title}</h1>
              <p className="text-2xl font-semibold text-primary mt-2">
                {formatPrice(listing.price)}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-gray-600">{listing.location}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-gray-600">
                  {listing.profiles.rating.toFixed(1)} ({listing.profiles.total_reviews} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Condition</p>
                  <p className="font-medium">{listing.condition}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{listing.category.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Listed</p>
                  <p className="font-medium">
                    {new Date(listing.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Views</p>
                  <p className="font-medium">{listing.views || 0}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Seller Information</h2>
              <Card className="p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={listing.profiles.avatar_url || 'https://via.placeholder.com/50'}
                    alt={listing.profiles.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{listing.profiles.full_name}</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {listing.profiles.rating.toFixed(1)} ({listing.profiles.total_reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                {listing.profiles.phone && (
                  <div className="mt-4 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{listing.profiles.phone}</span>
                  </div>
                )}
              </Card>
            </div>

            <div className="flex space-x-4">
              <Button
                variant={isFavorited ? "destructive" : "outline"}
                onClick={handleFavorite}
                disabled={isLoading}
                className="flex-1"
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
              {user && user.id !== listing.seller_id && (
                <Button
                  variant="default"
                  onClick={() => navigate(`/messages/${listing.id}`)}
                  className="flex-1"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Seller
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
