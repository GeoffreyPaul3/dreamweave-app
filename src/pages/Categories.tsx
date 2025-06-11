<<<<<<< HEAD
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
  }, [selectedCategory, sortBy]);

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
          <p className="text-xl text-gray-600">
            Find the perfect products in your preferred category
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card
              className={`p-4 text-center cursor-pointer transition-all duration-300 ${
                selectedCategory === 'all' ? 'border-primary bg-primary/5' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🛍️</span>
              </div>
              <h3 className="font-medium text-sm">All</h3>
            </Card>
            
            {categories.map((category, index) => (
              <Card
                key={category.id}
                className={`p-4 text-center cursor-pointer transition-all duration-300 ${
                  selectedCategory === category.name ? 'border-primary bg-primary/5' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className={`w-12 h-12 ${getColorClass(index)} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-xl">{getIconEmoji(category.icon)}</span>
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${listings.length} product${listings.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400">Try adjusting your search or category filter</p>
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
=======
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
  }, [selectedCategory, sortBy]);

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
          <p className="text-xl text-gray-600">
            Find the perfect products in your preferred category
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card
              className={`p-4 text-center cursor-pointer transition-all duration-300 ${
                selectedCategory === 'all' ? 'border-primary bg-primary/5' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🛍️</span>
              </div>
              <h3 className="font-medium text-sm">All</h3>
            </Card>
            
            {categories.map((category, index) => (
              <Card
                key={category.id}
                className={`p-4 text-center cursor-pointer transition-all duration-300 ${
                  selectedCategory === category.name ? 'border-primary bg-primary/5' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className={`w-12 h-12 ${getColorClass(index)} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-xl">{getIconEmoji(category.icon)}</span>
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${listings.length} product${listings.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400">Try adjusting your search or category filter</p>
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
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
