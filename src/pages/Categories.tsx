/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: string;
  created_at: string;
  seller_id: string;
  status: string;
  featured_image: string;
  views: number;
  likes: number;
  profiles: {
    full_name: string;
    rating: number;
    total_reviews: number;
  } | null;
  favorites: any[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const Categories = () => {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(categoryName || 'all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchListings();

      // Set up real-time subscription for listings
      const channel = supabase
        .channel('listings_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'listings'
          },
          () => {
            fetchListings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, categories]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchListings = async () => {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles!seller_id(full_name, rating, total_reviews)
        `)
        .eq('status', 'active');

      if (selectedCategory && selectedCategory !== 'all') {
        const categoryData = categories.find(cat => cat.name === selectedCategory);
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        images: item.images || [],
        location: item.location,
        created_at: item.created_at,
        seller_id: item.seller_id,
        status: item.status,
        featured_image: item.featured_image || (item.images && item.images.length > 0 ? item.images[0] : ''),
        views: item.views || 0,
        likes: item.likes || 0,
        profiles: item.profiles ? {
          full_name: (item.profiles as any).full_name || '',
          rating: (item.profiles as any).rating || 0,
          total_reviews: (item.profiles as any).total_reviews || 0
        } : null,
        favorites: []
      })) || [];
      
      setListings(transformedData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchListings();
  };

  const getIconEmoji = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'Smartphone': '📱',
      'Shirt': '👗',
      'Home': '🏠',
      'Car': '🚗',
      'Briefcase': '💼',
      'Settings': '🔧',
      'Wheat': '🌾'
    };
    return iconMap[iconName] || '📦';
  };

  const getColorClass = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through our wide range of categories to find exactly what you're looking for
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCategory === 'all' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">All Categories</h3>
              <p className="text-gray-600 text-sm">
                Browse all listings across all categories
              </p>
            </div>
          </Card>

          {categories.map((category, index) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCategory === category.name ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(category.name)}
            >
              <div className="p-6">
                <div className={`w-12 h-12 ${getColorClass(index)} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{getIconEmoji(category.icon)}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Listings Found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Categories;
