/* eslint-disable @typescript-eslint/no-explicit-any */
import { AmazonProduct } from '../amazon-uae/types';
import { rapidAPIAmazonService } from '../amazon-uae/rapidapi-service';
import { sheinService, SheinProduct } from '../shein/service';

export interface CombinedProduct extends AmazonProduct {
  source: 'amazon' | 'shein';
  original_data?: any; // Store original API response for debugging
}

export interface SearchOptions {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  prioritizeFashion?: boolean;
}

/**
 * Combined Store Service - Fetches products from both Amazon and Shein
 */
class CombinedStoreService {
  private static instance: CombinedStoreService;
  private healthCheckCache: { amazon: boolean; shein: boolean } | null = null;
  private healthCheckTimestamp: number = 0;
  private readonly HEALTH_CHECK_CACHE_DURATION = 60000; // 1 minute cache
  private isHealthChecking = false;
  private isFetchingProducts = false;

  private constructor() {}

  static getInstance(): CombinedStoreService {
    if (!CombinedStoreService.instance) {
      CombinedStoreService.instance = new CombinedStoreService();
    }
    return CombinedStoreService.instance;
  }

  /**
   * Fetch products from both Amazon and Shein with intelligent fallback
   */
  async fetchProducts(options: SearchOptions = {}): Promise<CombinedProduct[]> {
    const { category = '', search = '', page = 1, limit = 50, prioritizeFashion = true } = options;
    
    // Prevent multiple simultaneous requests
    if (this.isFetchingProducts) {
      console.log('Product fetch already in progress, returning cached or empty results');
      return [];
    }
    
    this.isFetchingProducts = true;
    
    try {
      console.log('Attempting to fetch Amazon products...');
      
      // Try Amazon first
      let amazonProducts: AmazonProduct[] = [];
      try {
        amazonProducts = await rapidAPIAmazonService.fetchProducts(category, search);
        console.log(`Successfully fetched ${amazonProducts.length} Amazon products`);
      } catch (error: any) {
        console.error('Amazon API request failed:', error);
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          console.log('Amazon API rate limited, skipping Amazon products');
        }
      }

      console.log('Attempting to fetch Shein products...');
      
      // Try Shein as fallback or supplement
      let sheinProducts: AmazonProduct[] = [];
      try {
        const rawSheinProducts = await sheinService.searchProducts(
          search || category || 'fashion',
          'US',
          page,
          Math.min(limit, 25) // Limit Shein requests to reduce rate limiting
        );
        
        sheinProducts = rawSheinProducts.map(product => sheinService.convertToAmazonFormat(product));
        console.log(`Successfully fetched ${sheinProducts.length} Shein products`);
      } catch (error: any) {
        console.error('Shein API request failed:', error);
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          console.log('Shein API rate limited, skipping Shein products');
        }
      }

      // Combine and sort products
      const combinedProducts: CombinedProduct[] = [
        ...amazonProducts.map(product => ({ ...product, source: 'amazon' as const })),
        ...sheinProducts.map(product => ({ ...product, source: 'shein' as const }))
      ];

      // Sort products based on search relevance and source priority
      const sortedProducts = this.sortProducts(combinedProducts, {
        search,
        category,
        prioritizeFashion,
        amazonFirst: true
      });

      console.log(`Returning ${sortedProducts.length} combined products (Amazon: ${amazonProducts.length}, Shein: ${sheinProducts.length})`);
      
      return sortedProducts.slice(0, limit);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      return [];
    } finally {
      this.isFetchingProducts = false;
    }
  }

  /**
   * Get product details from either Amazon or Shein
   */
  async getProductDetails(productId: string): Promise<CombinedProduct | null> {
    try {
      if (productId.startsWith('shein_')) {
        // Extract Shein product ID
        const sheinId = productId.replace('shein_', '');
        const sheinProductDetails = await sheinService.getProductDetails(sheinId);
        if (sheinProductDetails) {
          // Convert SheinProductDetails to SheinProduct format for conversion
          const sheinProduct: SheinProduct = {
            id: sheinId,
            goods_sn: sheinProductDetails.goods_sn || '',
            goods_spu: sheinProductDetails.goods_spu || '',
            title: sheinProductDetails.title || '',
            description: sheinProductDetails.description || '',
            price: sheinProductDetails.price || 0,
            original_price: sheinProductDetails.original_price || 0,
            currency: sheinProductDetails.currency || 'USD',
            image_url: sheinProductDetails.images?.[0] || '',
            images: sheinProductDetails.images || [],
            category: sheinProductDetails.category || '',
            brand: sheinProductDetails.brand || '',
            rating: sheinProductDetails.rating || 0,
            review_count: sheinProductDetails.review_count || 0,
            availability: sheinProductDetails.availability || false,
            sizes: sheinProductDetails.sizes || [],
            colors: sheinProductDetails.colors || [],
            country: sheinProductDetails.country || 'US',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return { ...sheinService.convertToAmazonFormat(sheinProduct), source: 'shein' as const };
        }
      } else {
        // Try Amazon product
        const amazonProduct = await rapidAPIAmazonService.getProductDetails(productId);
        if (amazonProduct) {
          // Ensure the product has all required fields for CombinedProduct
          const combinedProduct: CombinedProduct = {
            id: productId,
            asin: amazonProduct.asin || productId,
            title: amazonProduct.product_title || '',
            description: amazonProduct.product_description || '',
            price: parseFloat(amazonProduct.product_price || '0'),
            currency: 'MWK',
            shipping_cost: 0,
            image_url: amazonProduct.product_photo || '',
            category: '',
            brand: amazonProduct.product_brand || '',
            rating: 0,
            review_count: 0,
            availability: true,
            source: 'amazon' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return combinedProduct;
        }
      }
    } catch (error) {
      console.error('Error getting product details:', error);
    }
    return null;
  }

  /**
   * Get categories from both sources
   */
  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    
    try {
      // Add Amazon categories - using hardcoded categories since getCategories doesn't exist
      const amazonCategories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports & Fitness', 'Books & Toys', 'Beauty & Health', 'Automotive'];
      amazonCategories.forEach(cat => categories.add(cat));
    } catch (error) {
      console.error('Error fetching Amazon categories:', error);
    }
    
    try {
      // Add Shein categories
      const sheinCategories = await sheinService.getCategories();
      sheinCategories.forEach(cat => categories.add(cat.name || cat));
    } catch (error) {
      console.error('Error fetching Shein categories:', error);
    }
    
    return Array.from(categories).sort();
  }

  /**
   * Health check with caching to prevent excessive API calls
   */
  async healthCheck(): Promise<{ amazon: boolean; shein: boolean }> {
    // Check cache first
    const now = Date.now();
    if (this.healthCheckCache && (now - this.healthCheckTimestamp) < this.HEALTH_CHECK_CACHE_DURATION) {
      console.log('Using cached health check results');
      return this.healthCheckCache;
    }

    // Prevent multiple simultaneous health checks
    if (this.isHealthChecking) {
      console.log('Health check already in progress, returning cached results');
      return this.healthCheckCache || { amazon: false, shein: false };
    }

    this.isHealthChecking = true;
    
    try {
      console.log('Performing health check...');
      
      const results = { amazon: false, shein: false };
      
      // Check Amazon API
      try {
        await rapidAPIAmazonService.isAPIAvailable();
        results.amazon = true;
        console.log('Amazon API: Online');
      } catch (error: any) {
        console.log('Amazon API: Offline -', error.message);
        results.amazon = false;
      }
      
      // Check Shein API with reduced request size
      try {
        await sheinService.searchProducts('fashion', 'US', 1, 1);
        results.shein = true;
        console.log('Shein API: Online');
      } catch (error: any) {
        console.log('Shein API: Offline -', error.message);
        results.shein = false;
      }
      
      // Cache results
      this.healthCheckCache = results;
      this.healthCheckTimestamp = now;
      
      return results;
    } catch (error) {
      console.error('Health check error:', error);
      return { amazon: false, shein: false };
    } finally {
      this.isHealthChecking = false;
    }
  }

  /**
   * Get fashion products from Shein (with rate limiting)
   */
  async getFashionProducts(search: string = '', limit: number = 50): Promise<CombinedProduct[]> {
    try {
      const sheinProducts = await sheinService.searchProducts(
        search || 'fashion',
        'US',
        1,
        Math.min(limit, 25) // Limit to reduce rate limiting
      );
      
      return sheinProducts.map(product => ({
        ...sheinService.convertToAmazonFormat(product),
        source: 'shein' as const
      }));
    } catch (error: any) {
      console.error('Error fetching Shein fashion products:', error);
      if (error.message?.includes('429')) {
        console.log('Shein API rate limited, returning empty array');
      }
      return [];
    }
  }

  /**
   * Get electronics products from Amazon
   */
  async getElectronicsProducts(search: string = '', limit: number = 50): Promise<CombinedProduct[]> {
    try {
      const amazonProducts = await rapidAPIAmazonService.fetchProducts('Electronics', search);
      return amazonProducts.map(product => ({
        ...product,
        source: 'amazon' as const
      }));
    } catch (error: any) {
      console.error('Error fetching Amazon electronics products:', error);
      return [];
    }
  }

  /**
   * Clear health check cache (useful for testing or manual refresh)
   */
  clearHealthCheckCache(): void {
    this.healthCheckCache = null;
    this.healthCheckTimestamp = 0;
  }

  /**
   * Check if a category is fashion-related
   */
  private isFashionCategory(category: string): boolean {
    const fashionKeywords = ['fashion', 'clothing', 'apparel', 'dress', 'shirt', 'pants', 'shoes', 'accessories', 'jewelry'];
    return fashionKeywords.some(keyword => 
      category.toLowerCase().includes(keyword)
    );
  }

  /**
   * Check if a search term is fashion-related
   */
  private isFashionSearch(search: string): boolean {
    const fashionKeywords = ['dress', 'shirt', 'pants', 'shoes', 'bag', 'jewelry', 'accessories', 'fashion', 'style'];
    return fashionKeywords.some(keyword => 
      search.toLowerCase().includes(keyword)
    );
  }

  /**
   * Sort products based on relevance and source priority
   */
  private sortProducts(
    products: CombinedProduct[], 
    options: { 
      search: string; 
      category: string; 
      prioritizeFashion: boolean; 
      amazonFirst: boolean;
    }
  ): CombinedProduct[] {
    const { search, category, prioritizeFashion, amazonFirst } = options;
    
    return products.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Source priority (Amazon first by default)
      if (amazonFirst) {
        scoreA += a.source === 'amazon' ? 10 : 0;
        scoreB += b.source === 'amazon' ? 10 : 0;
      }
      
      // Fashion priority for Shein
      if (prioritizeFashion) {
        const isFashionSearch = this.isFashionSearch(search);
        const isFashionCategory = this.isFashionCategory(category);
        
        if (isFashionSearch || isFashionCategory) {
          scoreA += a.source === 'shein' ? 5 : 0;
          scoreB += b.source === 'shein' ? 5 : 0;
        }
      }
      
      // Rating priority
      scoreA += (a.rating || 0) * 2;
      scoreB += (b.rating || 0) * 2;
      
      // Review count priority
      scoreA += Math.min((a.review_count || 0) / 100, 5);
      scoreB += Math.min((b.review_count || 0) / 100, 5);
      
      return scoreB - scoreA;
    });
  }
}

export const combinedStoreService = CombinedStoreService.getInstance();
