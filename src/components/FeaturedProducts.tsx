
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ListingCard from './ListingCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { rapidAPIAmazonService } from '@/integrations/amazon-uae/rapidapi-service';

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

interface AmazonProduct {
  id: string;
  title: string;
  price: number;
  image_url: string;
  brand: string;
  category: string;
  rating: number;
  review_count: number;
  created_at: string;
}


const FeaturedProducts = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [amazonProducts, setAmazonProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  
  useEffect(() => {
    fetchFeaturedListings();
    fetchAmazonProducts();
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
        .limit(4);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchAmazonProducts = async () => {
    try {
      const products = await rapidAPIAmazonService.fetchProducts();
      setAmazonProducts(products.slice(0, 4)); // Get first 4 products
    } catch (error) {
      console.error('Error fetching Amazon products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Listings</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the newest items added by sellers across Malawi
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
        {/* Local Sellers Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Local Sellers</h3>
            <p className="text-gray-600">
              Discover the newest items added by local sellers across Malawi
            </p>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No local listings available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>

        {/* Dubai Store Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Dream Weave Dubai Store</h3>
            <p className="text-gray-600">
              Latest products from our Dubai store with fast delivery to Malawi
            </p>
          </div>

          {amazonProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No Dubai store products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {amazonProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div onClick={() => navigate(`/amazon/product/${product.id}`)}>
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm md:text-base font-semibold mb-2 line-clamp-2">
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`text-xs ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          ({product.review_count})
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-lg md:text-xl font-bold text-green-600">
                            MWK {product.price.toLocaleString()}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {product.brand}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 pt-0">
                    <Button 
                      onClick={() => navigate(`/amazon/product/${product.id}`)}
                      className="w-full"
                      size="sm"
                    >
                      <span className="text-xs md:text-sm">View Product</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              onClick={() => navigate('/categories')}
            >
              View All Local Products
            </Button>
            <Button 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              onClick={() => navigate('/amazon')}
            >
              View Dubai Store
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
