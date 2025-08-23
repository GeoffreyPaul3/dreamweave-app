import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Star, Truck, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { rapidAPIAmazonService } from '@/integrations/amazon-uae/rapidapi-service';
import { AmazonProduct } from '@/integrations/amazon-uae/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useAmazonCart } from '@/contexts/AmazonCartContext';
import { useToast } from '@/hooks/use-toast';

const AmazonStore = () => {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Separate state for immediate input value and actual search term
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem, state } = useAmazonCart();
  const { toast } = useToast();

  // Ref for debounce timeout
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Fitness',
    'Books & Toys',
    'Beauty & Health',
    'Automotive'
  ];

  // Debounced search function
  const debouncedSearch = useCallback((searchValue: string) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchTerm(searchValue);
      setSearchLoading(true);
      setCurrentPage(1); // Reset to first page when search changes
    }, 800); // 800ms delay for better UX
  }, []);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rapidAPIAmazonService.fetchProducts(selectedCategory, searchTerm);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/amazon/product/${productId}`);
  };

  const handleAddToCart = (product: AmazonProduct) => {
    addItem(product, 1);
    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart`,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
                 <div className="container mx-auto px-4 py-8">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-300 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
                 <div className="gradient-primary text-white rounded-lg p-8 mb-8">
           <h1 className="text-4xl font-bold mb-4">Dream Weave Dubai Store</h1>
           <p className="text-xl mb-6">
             Shop the latest products from Dream Weave Dubai with fast delivery to Malawi
           </p>
          <div className="flex items-center space-x-4">
            <Truck className="w-6 h-6" />
            <span>10-15 days delivery</span>
            <Badge variant="secondary" className="bg-white text-blue-600">
              MWK 250K - 20M Orders
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search Dream Weave Dubai products..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
              )}
            </div>
                         <Button onClick={() => navigate('/amazon/cart')} className="flex items-center gap-2">
               <ShoppingCart className="w-4 h-4" />
               Cart ({state.totalItems})
             </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              size="sm"
              disabled={loading}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                disabled={loading}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

                 {/* Products Grid */}
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {currentProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div onClick={() => handleProductClick(product.id)}>
                                 <div className="aspect-square overflow-hidden rounded-t-lg">
                   <img
                     src={product.image_url}
                     alt={product.title}
                     className="w-full h-full object-cover hover:scale-105 transition-transform"
                   />
                 </div>
                 <CardContent className="p-3">
                                     <CardTitle className="text-sm md:text-base font-semibold mb-2 line-clamp-2">
                     {product.title}
                   </CardTitle>
                  
                                     <div className="flex items-center gap-1 mb-2">
                     {renderStars(product.rating)}
                     <span className="text-xs md:text-sm text-gray-600 ml-1">
                       ({product.review_count})
                     </span>
                   </div>

                                     <div className="space-y-1">
                     <div className="flex items-center justify-between">
                       <span className="text-lg md:text-xl font-bold text-green-600">
                         MWK {product.price.toLocaleString()}
                       </span>
                     </div>
                     
                     <div className="text-xs md:text-sm text-gray-600">
                       Shipping: MWK {product.shipping_cost.toLocaleString()}
                     </div>
                     
                     <div className="text-xs md:text-sm text-gray-500">
                       Total: MWK {(product.price + product.shipping_cost).toLocaleString()}
                     </div>
                     
                     {/* Show size and color for fashion products */}
                     {product.category === 'Fashion' && (product.size || product.color) && (
                       <div className="flex flex-wrap gap-1 mt-2">
                         {product.size && (
                           <Badge variant="secondary" className="text-xs">
                             Size: {product.size}
                           </Badge>
                         )}
                         {product.color && (
                           <Badge variant="secondary" className="text-xs">
                             Color: {product.color}
                           </Badge>
                         )}
                       </div>
                     )}
                   </div>
                </CardContent>
              </div>
              
                             <div className="p-3 pt-0">
                 <Button 
                   onClick={() => handleAddToCart(product)}
                   className="w-full"
                   size="sm"
                 >
                   <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                   <span className="text-xs md:text-sm">Add to Cart</span>
                 </Button>
               </div>
            </Card>
          ))}
        </div>

        {currentProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or category filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <div className="text-sm text-gray-600 mr-4">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, products.length)} of {products.length} products
            </div>
            <div className="flex items-center gap-1">
              {renderPagination()}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AmazonStore;
