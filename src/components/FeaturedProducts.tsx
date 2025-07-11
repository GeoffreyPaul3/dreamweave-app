
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ListingCard from './ListingCard';
import { Button } from '@/components/ui/button';
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


const FeaturedProducts = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  
  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:seller_id (
            full_name,
            rating,
            total_reviews
          ),
          favorites (
            user_id
          )
        `)
        .eq('status', 'active')
        .eq('payment_verified', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      if (data) {
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hand-picked quality items from trusted sellers across Malawi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hand-picked quality items from trusted sellers across Malawi
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No approved listings available yet.</p>
            <p className="text-gray-400">Check back soon for new products!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
               className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
               onClick={() => navigate('/categories')}
               >
                View All Products
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
