/* eslint-disable @typescript-eslint/no-explicit-any */
import { AmazonProduct } from '../amazon-uae/types';

export interface SheinProduct {
  id: string;
  goods_sn: string;
  goods_spu: string;
  title: string;
  description: string;
  price: number;
  original_price: number;
  currency: string;
  image_url: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  review_count: number;
  availability: boolean;
  sizes: string[];
  colors: string[];
  country: string;
  created_at: string;
  updated_at: string;
}

export interface SheinSearchResult {
  products: SheinProduct[];
  total: number;
  page: number;
  perPage: number;
}

export interface SheinProductDetails {
  goods_sn: string;
  goods_spu: string;
  title: string;
  description: string;
  price: number;
  original_price: number;
  currency: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  review_count: number;
  availability: boolean;
  sizes: string[];
  colors: string[];
  country: string;
  specifications: Record<string, any>;
  reviews: any[];
}

/**
 * Shein Data API Service
 */
class SheinService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = 'a9ea8a45e1msh198c2311c524464p18b89djsn75653a176b08';
    this.baseUrl = 'https://shein-data-api.p.rapidapi.com';
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'shein-data-api.p.rapidapi.com',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Shein API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for products on Shein
   */
  async searchProducts(
    query: string,
    country: string = 'US',
    page: number = 1,
    perPage: number = 50,
    orderBy: string = 'recommend'
  ): Promise<SheinProduct[]> {
    try {
      const params = {
        query,
        page: page.toString(),
        perPage: perPage.toString(),
        countryCode: country,
        orderBy
      };

      const response = await this.makeRequest<SheinSearchResult>('/search/v2', params);
      return response.products || [];
    } catch (error) {
      console.error('Failed to search Shein products:', error);
      return [];
    }
  }

  /**
   * Get detailed product information by SKU
   */
  async getProductDetails(goods_sn: string, country: string = 'US'): Promise<SheinProductDetails | null> {
    try {
      const params = {
        goods_sn,
        country
      };

      const response = await this.makeRequest<SheinProductDetails>('/product/description/v2', params);
      return response;
    } catch (error) {
      console.error('Failed to get Shein product details:', error);
      return null;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    country: string = 'US',
    page: number = 1,
    perPage: number = 50,
    orderBy: string = 'recommend'
  ): Promise<SheinProduct[]> {
    try {
      const params = {
        categoryId,
        page: page.toString(),
        perPage: perPage.toString(),
        countryCode: country,
        orderBy
      };

      const response = await this.makeRequest<SheinSearchResult>('/product/bycategory', params);
      return response.products || [];
    } catch (error) {
      console.error('Failed to get Shein products by category:', error);
      return [];
    }
  }

  /**
   * Get all available categories
   */
  async getCategories(country: string = 'US'): Promise<any[]> {
    try {
      const params = {
        countryCode: country
      };

      const response = await this.makeRequest<any[]>('/categories', params);
      return response || [];
    } catch (error) {
      console.error('Failed to get Shein categories:', error);
      return [];
    }
  }

  /**
   * Convert Shein product to Amazon product format for consistency
   */
  convertToAmazonFormat(sheinProduct: SheinProduct): AmazonProduct {
    return {
      id: `shein_${sheinProduct.goods_sn}`,
      asin: sheinProduct.goods_sn,
      title: sheinProduct.title,
      description: sheinProduct.description,
      price: sheinProduct.price,
      currency: sheinProduct.currency,
      shipping_cost: 0, // Shein typically has free shipping
      image_url: sheinProduct.image_url,
      category: sheinProduct.category,
      brand: sheinProduct.brand || 'Shein',
      rating: sheinProduct.rating,
      review_count: sheinProduct.review_count,
      availability: sheinProduct.availability,
      created_at: sheinProduct.created_at,
      updated_at: sheinProduct.updated_at,
      // Additional Shein-specific fields
      size: sheinProduct.sizes?.[0] || null,
      color: sheinProduct.colors?.[0] || null,
      source: 'shein'
    };
  }
}

// Export singleton instance
export const sheinService = new SheinService();
