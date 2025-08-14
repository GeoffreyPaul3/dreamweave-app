export interface AmazonProduct {
  id: string;
  asin: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  shipping_cost: number;
  price_aed?: number; // Original price in UAE Dirhams for currency conversion
  shipping_cost_aed?: number; // Original shipping cost in UAE Dirhams for currency conversion
  image_url: string;
  category: string;
  brand: string;
  rating: number;
  review_count: number;
  availability: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: AmazonProduct;
  quantity: number;
}

export interface AmazonOrder {
  id: string;
  order_number: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product_price: number;
  shipping_cost: number;
  total_amount: number;
  status: 'pending' | 'payment_pending' | 'processing' | 'shipped' | 'delivered' | 'successful' | 'cancelled';
  delivery_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  order_date: string;
  estimated_delivery: string;
  actual_delivery?: string;
  tracking_number?: string;
  admin_notes?: string;
  paychangu_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface AmazonUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: {
    address_line1: string;
    address_line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  is_verified: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  minimum_order: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface OrderTracking {
  order_id: string;
  status: string;
  location?: string;
  description: string;
  timestamp: string;
}

export interface CurrencyConversionSettings {
  id: string;
  from_currency: string;
  to_currency: string;
  conversion_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
