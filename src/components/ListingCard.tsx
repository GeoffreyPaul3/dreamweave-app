import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star, Eye, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  featured_image: string;
  seller_id: string;
  views: number;
  likes: number;
  created_at: string;
  profiles: {
    full_name: string;
    rating: number;
    total_reviews: number;
  };
  favorites: Array<{ user_id: string }>;
}

interface ListingCardProps {
  listing: Listing;
  onMessage?: () => void;
}

const ListingCard = ({ listing, onMessage }: ListingCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(
    listing.favorites?.some(fav => fav.user_id === user?.id) || false
  );
  const [isLoading, setIsLoading] = useState(false);

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
          .eq('listing_id', listing.id);
        
        if (error) throw error;
        setIsFavorited(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listing.id
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
    
    // If it's already a full URL (from Supabase storage), return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it's from our storage bucket, construct the URL
    if (imagePath.includes('listing-images')) {
      return imagePath;
    }
    
    // Fallback to placeholder
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
  };

  const handleViewDetails = async () => {
    // Increment view count in the database
    await supabase
      .from('listings')
      .update({ views: (listing.views || 0) + 1 })
      .eq('id', listing.id);
    navigate(`/listing/${listing.id}`);
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <div className="aspect-square bg-gray-200 overflow-hidden">
          <img
            src={getImageUrl(listing.featured_image)}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
            }}
          />
        </div>
        
        <div className="absolute top-3 left-3 flex space-x-2">
          <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{listing.views || 0}</span>
          </div>
        </div>
        
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{formatPrice(listing.price)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1" />
          {listing.location || 'Location not specified'}
        </div>
        
        <div className="text-sm text-gray-500">
          By {listing.profiles?.full_name || 'Unknown Seller'}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1 group-hover:bg-primary group-hover:text-white transition-colors"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ListingCard;
