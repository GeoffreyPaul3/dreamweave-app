/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MapPin, Star, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ListingChat from '@/components/messaging/ListingChat';

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

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
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-4">The listing you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
              <img
                src={getImageUrl(listing.images?.[selectedImageIndex] || listing.featured_image)}
                alt={listing.title}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onLoad={() => setIsImageLoading(false)}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                  setIsImageLoading(false);
                }}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              {listing.status === 'sold' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">SOLD</span>
                </div>
              )}
              {listing.images && listing.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
                    onClick={handlePreviousImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-primary scale-105' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageLoading(true);
                      setIsZoomed(false);
                    }}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing.location}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  {listing.profiles?.rating || 0} ({listing.profiles?.total_reviews || 0} reviews)
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary">
              {formatPrice(listing.price)}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Condition</p>
                    <p className="font-medium">{listing.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{listing.category?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${listing.status === 'sold' ? 'text-red-600' : listing.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {listing.status?.charAt(0).toUpperCase() + (listing.status?.slice(1) || '')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Seller</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={listing.profiles?.avatar_url || '/default-avatar.png'}
                      alt={listing.profiles?.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{listing.profiles?.full_name}</p>
                    {user && listing.profiles?.phone && (
                      <p className="text-gray-600">{listing.profiles.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              {listing.status !== 'sold' && (
                <Button
                  className="flex-1"
                  onClick={handleFavorite}
                  disabled={isLoading}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              )}
            </div>

            {/* Add the ListingChat component only if the listing is not sold */}
            {listing.status !== 'sold' && (
              <ListingChat
                listingId={listing.id}
                sellerId={listing.seller_id}
                sellerName={listing.profiles?.full_name || 'Unknown Seller'}
                listingTitle={listing.title}
              />
            )}

            {isPaymentPending && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  Payment verification in progress. Please wait while we confirm your payment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails; 
