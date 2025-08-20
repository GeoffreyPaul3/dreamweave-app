/**
 * RapidAPI Amazon Data Service
 * Professional integration with Real-Time Amazon Data API
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from '@/integrations/supabase/client';
import { AmazonProduct, AmazonOrder, AmazonUser, CurrencyConversionSettings, RequestOrder } from '@/integrations/amazon-uae/types';
import { sendRequestOrderPricedEmail, sendRequestOrderShippedEmail, sendRequestOrderDeliveredEmail, sendEmail } from '@/lib/email';

// API Configuration
const RAPIDAPI_CONFIG = {
  BASE_URL: 'https://real-time-amazon-data.p.rapidapi.com',
  API_KEY: 'd696862c99msh1c9778640da230dp16b5bcjsn50fb1d426d1b',
  HOST: 'real-time-amazon-data.p.rapidapi.com'
} as const;

// TypeScript Interfaces
interface RapidAPIResponse<T> {
  status: 'OK' | 'ERROR';
  request_id: string;
  data?: T;
  error?: {
    message: string;
    code: number;
  };
}

interface AmazonProductSearchResult {
  product_id?: string;
  asin?: string;
  product_title: string;
  product_photo?: string;
  product_photos?: string[];
  product_price: string;
  product_original_price?: string;
  product_rating?: number;
  product_num_ratings?: number;
  product_url: string;
  product_availability_status: string;
  product_description?: string;
  product_brand?: string;
  product_model?: string;
  product_weight?: string;
  product_dimensions?: string;
}

interface AmazonProductDetails extends AmazonProductSearchResult {
  // Additional fields for detailed product info
  // This interface can be extended with additional fields as needed
  product_variations?: Array<{
    color?: string;
    size?: string;
    price?: string;
  }>;
}

interface ConvertedAmazonProduct {
  id: string;
  asin: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  price_aed: number;
  shipping_cost: number;
  shipping_cost_aed: number;
  description: string;
  image_url: string;
  availability: boolean;
  currency: string;
  rating: number;
  review_count: number;
  product_url: string;
  size?: string; // Available sizes for fashion products
  color?: string; // Available colors for fashion products
  created_at: string;
  updated_at: string;
}

/**
 * Professional RapidAPI Amazon Data Service
 */
class RapidAPIAmazonService {
  private apiKey: string;
  private baseUrl: string;
  private host: string;

  constructor() {
    this.apiKey = RAPIDAPI_CONFIG.API_KEY;
    this.baseUrl = RAPIDAPI_CONFIG.BASE_URL;
    this.host = RAPIDAPI_CONFIG.HOST;
  }

  /**
   * Make authenticated API request to RapidAPI with retry logic
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}, retryCount = 0): Promise<T> {
    const maxRetries = 3;
    const baseDelay = 2000; // 2 seconds base delay
    
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host,
        },
      });

      if (response.status === 429 && retryCount < maxRetries) {
        // Rate limited - wait with exponential backoff
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`Rate limited (429). Waiting ${delay}ms before retry ${retryCount + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, params, retryCount + 1);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RapidAPIResponse<T> = await response.json();

      if (data.status === 'ERROR') {
        throw new Error(data.error?.message || 'API Error');
      }

      return data.data as T;
    } catch (error) {
      if (retryCount < maxRetries && (error instanceof Error && error.message.includes('429'))) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`Request failed. Waiting ${delay}ms before retry ${retryCount + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, params, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Search for products on Amazon
   */
  async searchProducts(
    query: string,
    country: string = 'US',
    page: number = 1,
    limit: number = 50
  ): Promise<AmazonProductSearchResult[]> {
    try {
      const params = {
        query,
        page: page.toString(),
        country,
        limit: limit.toString(),
        sort_by: 'RELEVANCE',
        product_condition: 'ALL',
        is_prime: 'false',
        deals_and_discounts: 'NONE'
      };

      const response = await this.makeRequest<{ products: AmazonProductSearchResult[] }>('/search', params);
      return response.products || [];
    } catch (error) {
      console.error('Failed to search products:', error);
      return [];
    }
  }

  /**
   * Get detailed product information by ASIN
   */
  async getProductDetails(asin: string, country: string = 'US'): Promise<AmazonProductDetails | null> {
    try {
      const params = {
        asin,
        country
      };

      const response = await this.makeRequest<AmazonProductDetails>('/product-details', params);
      return response;
    } catch (error) {
      console.error('Failed to get product details:', error);
      return null;
    }
  }

  /**
   * Get best sellers by category
   */
  async getBestSellers(
    category: string = 'All',
    country: string = 'US',
    limit: number = 50
  ): Promise<AmazonProductSearchResult[]> {
    try {
      const params = {
        category,
        country,
        limit: limit.toString()
      };

      const response = await this.makeRequest<{ products: AmazonProductSearchResult[] }>('/best-sellers', params);
      return response.products || [];
    } catch (error) {
      console.error('Failed to get best sellers:', error);
      return [];
    }
  }

  /**
   * Get Amazon deals
   */
  async getDeals(country: string = 'US', limit: number = 50): Promise<AmazonProductSearchResult[]> {
    try {
      const params = {
        country,
        limit: limit.toString()
      };

      const response = await this.makeRequest<{ deals: AmazonProductSearchResult[] }>('/deals-v2', params);
      return response.deals || [];
    } catch (error) {
      console.error('Failed to get deals:', error);
      return [];
    }
  }

  /**
   * Extract price from string
   */
  private extractPrice(priceString: string | undefined | null): number {
    if (!priceString) return 0;
    const match = priceString.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
  }

  /**
   * Get currency for country
   */
  private getCurrencyForCountry(country: string): string {
    const currencyMap: Record<string, string> = {
      'US': 'USD',
      'CA': 'CAD',
      'UK': 'GBP',
      'DE': 'EUR',
      'FR': 'EUR',
      'IT': 'EUR',
      'ES': 'EUR',
      'JP': 'JPY',
      'IN': 'INR',
      'AU': 'AUD',
      'BR': 'BRL',
      'MX': 'MXN',
      'AE': 'AED',
      'SA': 'SAR',
      'EG': 'EGP',
      'SG': 'SGD',
      'NL': 'EUR',
      'SE': 'SEK',
      'PL': 'PLN',
      'TR': 'TRY',
    };
    
    return currencyMap[country] || 'USD';
  }

  /**
   * Convert RapidAPI product to our format
   */
  private convertToAmazonProduct(
    rapidProduct: AmazonProductSearchResult | AmazonProductDetails,
    country: string = 'US',
    conversionRate: number = 1250,
    query: string = 'electronics' // Added query parameter
  ): ConvertedAmazonProduct {
    // Validate that we have a valid product
    if (!rapidProduct || (!rapidProduct.product_id && !rapidProduct.asin) || !rapidProduct.product_title) {
      throw new Error('Invalid product data received from API');
    }

    const price = this.extractPrice(rapidProduct.product_price);
    const originalPrice = rapidProduct.product_original_price ? this.extractPrice(rapidProduct.product_original_price) : price;
    const currency = this.getCurrencyForCountry(country);
    
    // Handle image URL
    let imageUrl = '';
    if (rapidProduct.product_photos && Array.isArray(rapidProduct.product_photos)) {
      imageUrl = rapidProduct.product_photos[0];
    } else if (rapidProduct.product_photo) {
      imageUrl = rapidProduct.product_photo;
    }

    // Map search queries to actual categories
    const getCategoryFromQuery = (query: string): string => {
      const categoryMap: Record<string, string> = {
        'electronics': 'Electronics',
        'smartphones': 'Electronics',
        'laptops': 'Electronics',
        'televisions': 'Electronics',
        'gaming consoles': 'Electronics',
        'fashion': 'Fashion',
        'home garden': 'Home & Garden',
        'sports fitness': 'Sports & Fitness',
        'books toys': 'Books & Toys',
        'beauty health': 'Beauty & Health',
        'automotive': 'Automotive'
      };
      return categoryMap[query] || 'Electronics';
    };
    
    const productId = rapidProduct.product_id || rapidProduct.asin || '';
    const category = getCategoryFromQuery(query);
    
    // Extract brand from title, description, or use provided brand
    const extractBrand = (title: string, description?: string, providedBrand?: string): string => {
      if (providedBrand && providedBrand.trim() !== '') {
        return providedBrand.trim();
      }
      
      // Common brand patterns to look for in title/description
      const brandPatterns = [
        // Electronics brands
        /\b(Apple|Samsung|Sony|LG|Panasonic|Philips|Bose|JBL|Sennheiser|Canon|Nikon|GoPro|DJI|Xiaomi|Huawei|OnePlus|Google|Microsoft|Dell|HP|Lenovo|Asus|Acer|Razer|Logitech|Corsair|SteelSeries)\b/gi,
        // Fashion brands
        /\b(Nike|Adidas|Puma|Under Armour|Reebok|New Balance|Converse|Vans|Levi's|Calvin Klein|Tommy Hilfiger|Ralph Lauren|Gap|H&M|Zara|Uniqlo|Forever 21|ASOS|Topshop|River Island)\b/gi,
        // Home & Garden brands
        /\b(IKEA|Bosch|Siemens|Whirlpool|Samsung|LG|Philips|Dyson|Hoover|Black & Decker|DeWalt|Makita|Ryobi|Craftsman|Stanley|Karcher)\b/gi,
        // Sports brands
        /\b(Nike|Adidas|Puma|Under Armour|Reebok|Wilson|Spalding|Rawlings|Easton|Bauer|CCM|Sherwood|Warrior|STX|Brine|Cascade)\b/gi,
        // Beauty brands
        /\b(L'Oreal|Maybelline|Revlon|CoverGirl|MAC|Estee Lauder|Clinique|Lancome|Dior|Chanel|YSL|NARS|Urban Decay|Too Faced|Benefit|The Ordinary)\b/gi,
        // General patterns
        /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:by|from|by\s+)\b/gi,
        /\b(?:Brand|Made by|Manufactured by):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
      ];
      
      const searchText = `${title} ${description || ''}`.toLowerCase();
      
      for (const pattern of brandPatterns) {
        const matches = searchText.match(pattern);
        if (matches && matches.length > 0) {
          // Clean up the brand name
          const brand = matches[0].replace(/\b(by|from|brand|made by|manufactured by):?\s*/gi, '').trim();
          if (brand.length > 2 && brand.length < 50) {
            return brand.charAt(0).toUpperCase() + brand.slice(1);
          }
        }
      }
      
      // If no brand found, try to extract from the beginning of the title
      const titleWords = title.split(' ');
      if (titleWords.length > 1) {
        const firstWord = titleWords[0];
        if (firstWord.length > 2 && firstWord.length < 20 && /^[A-Za-z]+$/.test(firstWord)) {
          return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
        }
      }
      
      return 'Unknown Brand';
    };
    
    // Extract size and color information for fashion products
    let size: string | undefined;
    let color: string | undefined;
    
    if (category === 'Fashion') {
      // Extract size from title or description
      const sizePatterns = [
        /\b(XS|S|M|L|XL|XXL|XXXL)\b/gi,
        /\b(\d{1,2})\s*(?:inch|")\b/gi,
        /\b(\d{2,3})\s*(?:cm|centimeter)\b/gi,
        /\b(\d{1,2}[-/]\d{1,2})\b/gi, // For ranges like 8-10, 32/34
      ];
      
      for (const pattern of sizePatterns) {
        const match = rapidProduct.product_title.match(pattern) || rapidProduct.product_description?.match(pattern);
        if (match) {
          size = match[0];
          break;
        }
      }
      
      // Extract color from title or description
      const colorPatterns = [
        /\b(Black|White|Red|Blue|Green|Yellow|Pink|Purple|Orange|Brown|Gray|Grey|Navy|Beige|Khaki|Olive|Maroon|Coral|Teal|Lavender|Mint|Cream|Gold|Silver|Bronze)\b/gi,
        /\b(Multi|Multi-color|Multicolor|Colorful|Neutral|Dark|Light|Bright|Pastel|Vintage|Classic|Modern)\b/gi,
      ];
      
      for (const pattern of colorPatterns) {
        const match = rapidProduct.product_title.match(pattern) || rapidProduct.product_description?.match(pattern);
        if (match) {
          color = match[0];
          break;
        }
      }
    }
    
    return {
      id: crypto.randomUUID(), // Generate a proper UUID for the id field
      asin: productId, // Use the ASIN for the asin field
      title: rapidProduct.product_title,
      brand: extractBrand(rapidProduct.product_title, rapidProduct.product_description, rapidProduct.product_brand),
      category: category, // Use the query to determine category
      price: price * conversionRate, // Convert to MWK
      price_aed: price, // Original AED price
      shipping_cost: 0, // Will be calculated based on conversion rate
      shipping_cost_aed: 0,
      description: rapidProduct.product_description || '',
      image_url: imageUrl,
      availability: rapidProduct.product_availability_status === 'In Stock',
      currency: 'MWK',
      rating: rapidProduct.product_rating || 0,
      review_count: rapidProduct.product_num_ratings || 0,
      product_url: rapidProduct.product_url,
      size: size,
      color: color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Test API connection with minimal requests
   */
  async testAPIConnection(): Promise<{
    success: boolean;
    message: string;
    productsFound: number;
  }> {
    try {
      console.log('Testing API connection...');
      
      // Check rate limit first
      const status = await this.getAPIStatus();
      if (!status.isAvailable) {
        return {
          success: false,
          message: status.message,
          productsFound: 0
        };
      }

      // Make a single, minimal API call
      const products = await this.searchProducts('test', 'AE', 1, 1);
      
      return {
        success: true,
        message: `API connection successful. Found ${products.length} test products.`,
        productsFound: products.length
      };
    } catch (error) {
      console.error('API connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        productsFound: 0
      };
    }
  }

  /**
   * Get API status and rate limit information
   */
  async getAPIStatus(): Promise<{
    isAvailable: boolean;
    rateLimitRemaining: number;
    rateLimitReset: number;
    message: string;
  }> {
    try {
      const rateLimitStatus = await this.checkRateLimitStatus();
      
      if (!rateLimitStatus) {
        return {
          isAvailable: false,
          rateLimitRemaining: 0,
          rateLimitReset: 0,
          message: 'Unable to check API status. Please verify your API key and internet connection.'
        };
      }

      const isAvailable = rateLimitStatus.remaining > 0;
      const resetTime = new Date(Date.now() + rateLimitStatus.reset * 1250);
      
      let message = '';
      if (isAvailable) {
        message = `API is available. ${rateLimitStatus.remaining} requests remaining.`;
      } else {
        message = `API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}.`;
      }

      return {
        isAvailable,
        rateLimitRemaining: rateLimitStatus.remaining,
        rateLimitReset: rateLimitStatus.reset,
        message
      };
    } catch (error) {
      console.error('Error checking API status:', error);
      return {
        isAvailable: false,
        rateLimitRemaining: 0,
        rateLimitReset: 0,
        message: 'Error checking API status. Please try again later.'
      };
    }
  }

  /**
   * Check current API rate limit status
   */
  async checkRateLimitStatus(): Promise<{ remaining: number; reset: number } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=test&country=AE&limit=1`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host,
        },
      });

      const remaining = response.headers.get('x-ratelimit-requests-remaining');
      const reset = response.headers.get('x-ratelimit-requests-reset');

      return {
        remaining: remaining ? parseInt(remaining) : 0,
        reset: reset ? parseInt(reset) : 0
      };
    } catch (error) {
      console.error('Error checking rate limit status:', error);
      return null;
    }
  }

  /**
   * Check if API is available without making a request
   */
  async isAPIAvailable(): Promise<boolean> {
    try {
      // Try to make a minimal request to check availability
      const response = await fetch(`${this.baseUrl}/search?query=test&country=AE&limit=1`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host,
        },
      });

      // If we get a 429, API is not available
      if (response.status === 429) {
        return false;
      }

      // If we get any other error, assume API is not available
      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking API availability:', error);
      return false;
    }
  }

  /**
   * Sync products from Amazon (Main functionality)
   */
  async syncProductsFromAmazon(country: string = 'AE', limit: number = 80): Promise<ConvertedAmazonProduct[]> {
    try {
      console.log('Starting Amazon product sync...');
      
      // Check if API is available before proceeding
      const isAvailable = await this.isAPIAvailable();
      if (!isAvailable) {
        throw new Error('API rate limit exceeded. Please try again in a few minutes or upgrade your RapidAPI plan.');
      }
      
      // Get current conversion rate from database
      const conversionRate = await this.getCurrentConversionRate();

      // Define multiple categories to search
      const categories = [
        { query: 'electronics', category: 'Electronics' },
        { query: 'smartphones', category: 'Electronics' },
        { query: 'laptops', category: 'Electronics' },
        { query: 'televisions', category: 'Electronics' },
        { query: 'gaming consoles', category: 'Electronics' },
        { query: 'fashion', category: 'Fashion' },
        { query: 'home garden', category: 'Home & Garden' },
        { query: 'sports fitness', category: 'Sports & Fitness' },
        { query: 'books toys', category: 'Books & Toys' },
        { query: 'beauty health', category: 'Beauty & Health' },
        { query: 'automotive', category: 'Automotive' }
      ];

      const allProducts: ConvertedAmazonProduct[] = [];
      const productsPerCategory = Math.min(limit / categories.length, 8); // 8 products per category (88 total)

      console.log(`Will search ${categories.length} categories with ${productsPerCategory} products each`);

      for (const categoryInfo of categories) {
        try {
          console.log(`Searching for: ${categoryInfo.query} (limit: ${productsPerCategory})`);
          
          // Make API call for this category
          const products = await this.searchProducts(categoryInfo.query, country, 1, productsPerCategory);
          
          if (!products || products.length === 0) {
            console.log(`No products found for query: ${categoryInfo.query}`);
            continue;
          }
          
          console.log(`Found ${products.length} products for: ${categoryInfo.query}`);
          
          // Process all products found for this category
          const maxProductsToProcess = Math.min(products.length, productsPerCategory);
          
                     for (let i = 0; i < maxProductsToProcess; i++) {
             const rapidProduct = products[i];
             
             try {
               // Validate product data before processing
               if (!rapidProduct || (!rapidProduct.product_id && !rapidProduct.asin) || !rapidProduct.product_title) {
                 console.warn('Skipping invalid product:', rapidProduct);
                 continue;
               }

               // Check if this ASIN already exists in our database
               const productId = rapidProduct.product_id || rapidProduct.asin || '';
               const { data: existingProduct } = await supabase
                 .from('amazon_products' as any)
                 .select('id')
                 .eq('asin', productId)
                 .single();

               if (existingProduct) {
                 console.log(`Skipping existing product: ${rapidProduct.product_title} (ASIN: ${productId})`);
                 continue;
               }

               // Convert to our format without making additional API calls
               const amazonProduct = this.convertToAmazonProduct(rapidProduct, country, conversionRate, categoryInfo.query);
               allProducts.push(amazonProduct);

               console.log(`Processed product ${i + 1}/${maxProductsToProcess} (${categoryInfo.category}): ${amazonProduct.title}`);
               
               // Small delay between processing to avoid overwhelming the API
               await new Promise(resolve => setTimeout(resolve, 500));
             } catch (productError) {
               console.error(`Error processing product ${rapidProduct?.product_id || 'unknown'}:`, productError);
               continue;
             }
           }

          // Delay between categories to avoid rate limits
          if (categories.indexOf(categoryInfo) < categories.length - 1) {
            console.log(`Waiting 2 seconds before next category...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (categoryError) {
          console.error(`Error processing category ${categoryInfo.query}:`, categoryError);
          continue;
        }
      }

      console.log(`Successfully processed ${allProducts.length} products from Amazon ${country}`);
      
      // Upsert fetched products into the database
      if (allProducts.length > 0) {
        console.log('Saving products to database...');
        const upsertPromises = allProducts.map(product => this.upsertProduct(product));
        await Promise.all(upsertPromises);
        console.log('Products saved to database successfully');
      }
      
      return allProducts;
    } catch (error) {
      console.error('Error syncing products from Amazon:', error);
      
      // Provide specific error message for rate limiting
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error('API rate limit exceeded. Please try again in a few minutes or upgrade your RapidAPI plan.');
      }
      
      throw error;
    }
  }

  /**
   * Update existing products with improved brand extraction
   */
  async updateExistingProductBrands(): Promise<{
    success: boolean;
    message: string;
    updatedCount: number;
    totalCount: number;
  }> {
    try {
      console.log('Starting brand update for existing products...');
      
      // Get all products with "Unknown Brand"
      const { data: products, error } = await supabase
        .from('amazon_products' as any)
        .select('id, title, description, brand')
        .eq('brand', 'Unknown Brand');

      if (error) {
        console.error('Error fetching products for brand update:', error);
        return {
          success: false,
          message: 'Failed to fetch products for brand update',
          updatedCount: 0,
          totalCount: 0
        };
      }

      if (!products || products.length === 0) {
        return {
          success: true,
          message: 'No products with "Unknown Brand" found to update',
          updatedCount: 0,
          totalCount: 0
        };
      }

      console.log(`Found ${products.length} products with "Unknown Brand" to update`);

      let updatedCount = 0;
      const updatePromises = products.map(async (product: any) => {
        try {
          // Extract brand using the same logic as convertToAmazonProduct
          const extractBrand = (title: string, description?: string, providedBrand?: string): string => {
            if (providedBrand && providedBrand.trim() !== '' && providedBrand.trim() !== 'Unknown Brand') {
              return providedBrand.trim();
            }
            
            // Common brand patterns to look for in title/description
            const brandPatterns = [
              // Electronics brands
              /\b(Apple|Samsung|Sony|LG|Panasonic|Philips|Bose|JBL|Sennheiser|Canon|Nikon|GoPro|DJI|Xiaomi|Huawei|OnePlus|Google|Microsoft|Dell|HP|Lenovo|Asus|Acer|Razer|Logitech|Corsair|SteelSeries)\b/gi,
              // Fashion brands
              /\b(Nike|Adidas|Puma|Under Armour|Reebok|New Balance|Converse|Vans|Levi's|Calvin Klein|Tommy Hilfiger|Ralph Lauren|Gap|H&M|Zara|Uniqlo|Forever 21|ASOS|Topshop|River Island)\b/gi,
              // Home & Garden brands
              /\b(IKEA|Bosch|Siemens|Whirlpool|Samsung|LG|Philips|Dyson|Hoover|Black & Decker|DeWalt|Makita|Ryobi|Craftsman|Stanley|Karcher)\b/gi,
              // Sports brands
              /\b(Nike|Adidas|Puma|Under Armour|Reebok|Wilson|Spalding|Rawlings|Easton|Bauer|CCM|Sherwood|Warrior|STX|Brine|Cascade)\b/gi,
              // Beauty brands
              /\b(L'Oreal|Maybelline|Revlon|CoverGirl|MAC|Estee Lauder|Clinique|Lancome|Dior|Chanel|YSL|NARS|Urban Decay|Too Faced|Benefit|The Ordinary)\b/gi,
              // General patterns
              /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:by|from|by\s+)\b/gi,
              /\b(?:Brand|Made by|Manufactured by):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
            ];
            
            const searchText = `${title} ${description || ''}`.toLowerCase();
            
            for (const pattern of brandPatterns) {
              const matches = searchText.match(pattern);
              if (matches && matches.length > 0) {
                // Clean up the brand name
                const brand = matches[0].replace(/\b(by|from|brand|made by|manufactured by):?\s*/gi, '').trim();
                if (brand.length > 2 && brand.length < 50) {
                  return brand.charAt(0).toUpperCase() + brand.slice(1);
                }
              }
            }
            
            // If no brand found, try to extract from the beginning of the title
            const titleWords = title.split(' ');
            if (titleWords.length > 1) {
              const firstWord = titleWords[0];
              if (firstWord.length > 2 && firstWord.length < 20 && /^[A-Za-z]+$/.test(firstWord)) {
                return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
              }
            }
            
            return 'Unknown Brand';
          };

          const newBrand = extractBrand(product.title, product.description, product.brand);
          
          // Only update if we found a better brand
          if (newBrand !== 'Unknown Brand') {
            const { error: updateError } = await supabase
              .from('amazon_products' as any)
              .update({
                brand: newBrand,
                updated_at: new Date().toISOString()
              })
              .eq('id', product.id);

            if (updateError) {
              console.error(`Error updating brand for product ${product.id}:`, updateError);
              return false;
            }

            console.log(`Updated brand for "${product.title}" from "Unknown Brand" to "${newBrand}"`);
            return true;
          }
          
          return false;
        } catch (productError) {
          console.error(`Error processing product ${product.id}:`, productError);
          return false;
        }
      });

      const results = await Promise.all(updatePromises);
      updatedCount = results.filter(result => result === true).length;

      console.log(`Successfully updated ${updatedCount} out of ${products.length} products`);

      return {
        success: true,
        message: `Successfully updated ${updatedCount} out of ${products.length} products with improved brand detection`,
        updatedCount,
        totalCount: products.length
      };
    } catch (error) {
      console.error('Error updating existing product brands:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        updatedCount: 0,
        totalCount: 0
      };
    }
  }

  // Real database methods for production
  async fetchProducts(category?: string, search?: string): Promise<AmazonProduct[]> {
    try {
      let query = supabase
        .from('amazon_products' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return (data as unknown as AmazonProduct[]) || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(productId: string): Promise<AmazonProduct | null> {
    try {
      console.log(`Looking for product with ID/ASIN: ${productId}`);
      
      // First try to find by id
      let { data, error } = await supabase
        .from('amazon_products' as any)
        .select('*')
        .eq('id', productId)
        .single();

      // If not found by id, try to find by asin
      if (error && error.code === 'PGRST116') {
        console.log(`Product not found by ID, trying ASIN: ${productId}`);
        const { data: asinData, error: asinError } = await supabase
          .from('amazon_products' as any)
          .select('*')
          .eq('asin', productId)
          .single();

        if (asinError) {
          console.error('Error fetching product by ASIN:', asinError);
          return null;
        }

        console.log(`Found product by ASIN: ${(asinData as any)?.title}`);
        return (asinData as unknown as AmazonProduct) || null;
      }

      if (error) {
        console.error('Error fetching product by ID:', error);
        return null;
      }

      console.log(`Found product by ID: ${(data as any)?.title}`);
      return (data as unknown as AmazonProduct) || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  // Debug method to check what products are in the database
  async debugProducts(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('amazon_products' as any)
        .select('id, asin, title')
        .limit(5);

      if (error) {
        console.error('Error fetching products for debug:', error);
        return;
      }

      console.log('Debug: Products in database:', data);
    } catch (error) {
      console.error('Error in debugProducts:', error);
    }
  }

  async getAllOrders(): Promise<AmazonOrder[]> {
    try {
      const { data, error } = await supabase
        .from('amazon_orders' as any)
        .select(`
          *,
          delivery_address:delivery_address
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return (data as unknown as AmazonOrder[]) || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getVerifiedUsers(): Promise<AmazonUser[]> {
    try {
      // Use profiles table instead of users table since that's what exists in Supabase
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verified users:', error);
        return [];
      }

      // Convert profiles to AmazonUser format or return empty array
      const users = (data as any[]) || [];
      return users.map(profile => ({
        id: profile.id || '',
        user_id: profile.id || '',
        full_name: profile.full_name || profile.name || 'Unknown User',
        email: profile.email || '',
        phone: profile.phone || '',
        address: {
          address_line1: profile.address_line1 || '',
          address_line2: profile.address_line2 || '',
          city: profile.city || '',
          postal_code: profile.postal_code || '',
          country: profile.country || ''
        },
        is_verified: profile.is_verified || false,
        total_orders: profile.total_orders || 0,
        total_spent: profile.total_spent || 0,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching verified users:', error);
      return [];
    }
  }

  async getCurrencyConversionSettings(): Promise<CurrencyConversionSettings | null> {
    try {
      // Get the first currency conversion setting
      const { data, error } = await supabase
        .from('currency_conversion_settings' as any)
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching currency conversion settings:', error);
        return null;
      }

      // If no data found, return null instead of default values
      if (!data || data.length === 0) {
        return null;
      }

      return (data[0] as unknown as CurrencyConversionSettings);
    } catch (error) {
      console.error('Error fetching currency conversion settings:', error);
      return null;
    }
  }

  private async getCurrentConversionRate(): Promise<number> {
    try {
      const settings = await this.getCurrencyConversionSettings();
      if (settings && settings.conversion_rate) {
        return settings.conversion_rate;
      }
      
      // If no settings exist, create a default one with 1000
      console.log('No conversion settings found, creating default...');
      const success = await this.updateCurrencyConversionRate(1000);
      if (success) {
        return 1000;
      }
      
      // If creation fails, return 1000 as fallback
      return 1000;
    } catch (error) {
      console.error('Error getting conversion rate:', error);
      return 1000; // Default fallback
    }
  }

  async updateCurrencyConversionRate(newRate: number): Promise<boolean> {
    try {
      // First check if settings exist
      const existingSettings = await this.getCurrencyConversionSettings();
      
      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('currency_conversion_settings' as any)
          .update({
            conversion_rate: newRate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);

        if (error) {
          console.error('Error updating conversion rate:', error);
          return false;
        }
      } else {
        // Create new settings
        const { error } = await supabase
          .from('currency_conversion_settings' as any)
          .insert({
            conversion_rate: newRate,
            from_currency: 'AED',
            to_currency: 'MWK',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating conversion rate settings:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating conversion rate:', error);
      return false;
    }
  }

  async updateAllProductPricesWithNewRate(newRate: number): Promise<boolean> {
    try {
      // Get all products with AED prices
      const { data: products, error: fetchError } = await supabase
        .from('amazon_products' as any)
        .select('id, price_aed, shipping_cost_aed')
        .not('price_aed', 'is', null);

      if (fetchError) {
        console.error('Error fetching products for price update:', fetchError);
        return false;
      }

      if (!products || products.length === 0) {
        console.log('No products found with AED prices to update');
        return true;
      }

      // Update each product's MWK price based on the new conversion rate
      const updatePromises = products.map((product: any) => {
        const newPrice = (product.price_aed || 0) * newRate;
        const newShippingCost = (product.shipping_cost_aed || 0) * newRate;

        return supabase
          .from('amazon_products' as any)
          .update({
            price: newPrice,
            shipping_cost: newShippingCost,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);
      });

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        console.error('Some products failed to update:', errors);
        return false;
      }

      console.log(`Successfully updated prices for ${products.length} products`);
      return true;
    } catch (error) {
      console.error('Error updating product prices:', error);
      return false;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('amazon_products' as any)
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async deleteAllProducts(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('amazon_products' as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products

      if (error) {
        console.error('Error deleting all products:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting all products:', error);
      return false;
    }
  }

  async upsertProduct(product: ConvertedAmazonProduct): Promise<boolean> {
    try {
      // First check if product already exists by ASIN
      const { data: existingProduct, error: checkError } = await supabase
        .from('amazon_products' as any)
        .select('id')
        .eq('asin', product.asin)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing product:', checkError);
        return false;
      }

             // If product exists, update it instead of inserting
       if (existingProduct !== null && typeof existingProduct === 'object' && 'id' in existingProduct && (existingProduct as any).id) {
        const updateData: any = {
          title: product.title,
          brand: product.brand,
          category: product.category,
          price: product.price,
          description: product.description,
          image_url: product.image_url,
          availability: product.availability,
          currency: product.currency,
          rating: product.rating,
          review_count: product.review_count,
          updated_at: product.updated_at
        };

        // Add optional fields if they exist
        if (product.price_aed !== undefined) updateData.price_aed = product.price_aed;
        if (product.shipping_cost !== undefined) updateData.shipping_cost = product.shipping_cost;
        if (product.shipping_cost_aed !== undefined) updateData.shipping_cost_aed = product.shipping_cost_aed;
        if (product.product_url !== undefined) updateData.product_url = product.product_url;
        if (product.size !== undefined) updateData.size = product.size;
        if (product.color !== undefined) updateData.color = product.color;

        const { error: updateError } = await supabase
          .from('amazon_products' as any)
          .update(updateData)
          .eq('id', (existingProduct as any).id);

        if (updateError) {
          console.error('Error updating existing product:', updateError);
          return false;
        }

        return true;
      }

      // If product doesn't exist, insert it
      const insertData: any = {
        id: product.id,
        asin: product.asin,
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        description: product.description,
        image_url: product.image_url,
        availability: product.availability,
        currency: product.currency,
        rating: product.rating,
        review_count: product.review_count,
        created_at: product.created_at,
        updated_at: product.updated_at
      };

      // Add optional fields if they exist
      if (product.price_aed !== undefined) insertData.price_aed = product.price_aed;
      if (product.shipping_cost !== undefined) insertData.shipping_cost = product.shipping_cost;
      if (product.shipping_cost_aed !== undefined) insertData.shipping_cost_aed = product.shipping_cost_aed;
      if (product.product_url !== undefined) insertData.product_url = product.product_url;
      if (product.size !== undefined) insertData.size = product.size;
      if (product.color !== undefined) insertData.color = product.color;

      const { error: insertError } = await supabase
        .from('amazon_products' as any)
        .insert(insertData);

      if (insertError) {
        console.error('Error inserting new product:', insertError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error upserting product:', error);
      return false;
    }
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('amazon_orders' as any)
        .update({
          status,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Request Orders Methods
  async getAllRequestOrders(): Promise<RequestOrder[]> {
    try {
      const { data, error } = await supabase
        .from('request_orders' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching request orders:', error);
        return [];
      }

      return (data as unknown as RequestOrder[]) || [];
    } catch (error) {
      console.error('Error fetching request orders:', error);
      return [];
    }
  }

  async getUserRequestOrders(userId: string): Promise<RequestOrder[]> {
    try {
      const { data, error } = await supabase
        .from('request_orders' as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user request orders:', error);
        return [];
      }

      return (data as unknown as RequestOrder[]) || [];
    } catch (error) {
      console.error('Error fetching user request orders:', error);
      return [];
    }
  }

  async updateRequestOrderStatus(requestId: string, status: string, adminPrice?: number, adminNotes?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (adminPrice !== undefined) {
        updateData.admin_price = adminPrice;
        updateData.deposit_amount = adminPrice * 0.5; // 50% deposit
      }

      if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('request_orders' as any)
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating request order status:', error);
        return false;
      }

      // Send email notifications based on status change
      try {
        // Get the updated order with user information
        const { data: orderData, error: fetchError } = await supabase
          .from('request_orders' as any)
          .select(`
            *,
            profiles:user_id (
              email,
              full_name
            )
          `)
          .eq('id', requestId)
          .single();

        if (!fetchError && orderData) {
          const userEmail = orderData.profiles?.email;
          const userName = orderData.profiles?.full_name || 'Valued Customer';

          if (userEmail) {
            if (status === 'priced' && adminPrice) {
              await sendRequestOrderPricedEmail(
                userEmail,
                userName,
                orderData.item_name,
                adminPrice,
                requestId
              );
            } else if (status === 'shipped') {
              await sendRequestOrderShippedEmail(
                userEmail,
                userName,
                orderData.item_name,
                orderData.admin_price || 0,
                requestId
              );
            } else if (status === 'delivered') {
              await sendRequestOrderDeliveredEmail(
                userEmail,
                userName,
                orderData.item_name,
                requestId
              );
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the status update if email fails
      }

      return true;
    } catch (error) {
      console.error('Error updating request order status:', error);
      return false;
    }
  }

  async updateRequestOrderDeposit(requestId: string, depositPaid: boolean, paymentId?: string): Promise<boolean> {
    try {
      const updateData: any = {
        deposit_paid: depositPaid,
        updated_at: new Date().toISOString()
      };

      if (paymentId) {
        updateData.deposit_payment_id = paymentId;
      }

      const { error } = await supabase
        .from('request_orders' as any)
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating request order deposit:', error);
        return false;
      }

      // Send email notification when deposit is paid
      if (depositPaid) {
        try {
          // Get the order with user information
          const { data: orderData, error: fetchError } = await supabase
            .from('request_orders' as any)
            .select(`
              *,
              profiles:user_id (
                email,
                full_name
              )
            `)
            .eq('id', requestId)
            .single();

          if (!fetchError && orderData) {
            const userEmail = orderData.profiles?.email;
            const userName = orderData.profiles?.full_name || 'Valued Customer';

            if (userEmail) {
              // Send deposit confirmation email
              const subject = 'Deposit Payment Confirmed!';
              const html = `
                <h1>Thank you ${userName}!</h1>
                <p>Your deposit payment for "${orderData.item_name}" has been confirmed.</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Order Details:</h3>
                  <p><strong>Item:</strong> ${orderData.item_name}</p>
                  <p><strong>Total Price:</strong> MWK ${(orderData.admin_price || 0).toLocaleString()}</p>
                  <p><strong>Deposit Paid:</strong> MWK ${((orderData.admin_price || 0) * 0.5).toLocaleString()}</p>
                </div>
                <p>We'll notify you when your order is ready to ship.</p>
                <a href="${import.meta.env.VITE_SITE_URL}/pay-requested-orders" style="
                  display: inline-block;
                  background-color: #4F46E5;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 4px;
                  margin-top: 16px;
                ">View Your Orders</a>
              `;

              await sendEmail({ to: userEmail, subject, html });
            }
          }
        } catch (emailError) {
          console.error('Error sending deposit confirmation email:', emailError);
          // Don't fail the deposit update if email fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating request order deposit:', error);
      return false;
    }
  }
}

// Export singleton instance
export const rapidAPIAmazonService = new RapidAPIAmazonService();
