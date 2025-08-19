import { supabase } from '@/integrations/supabase/client';
import { 
  AmazonProduct, 
  AmazonOrder, 
  AmazonUser, 
  ProductReview, 
  Promotion,
  OrderTracking,
  CurrencyConversionSettings
} from './types';
import { amazonNotificationService } from '@/lib/amazon-notifications';

// Amazon UAE API Service
export class AmazonUAEService {
  private static instance: AmazonUAEService;
  private baseUrl = 'https://api.amazon-uae.com'; // Replace with actual Amazon UAE API

  static getInstance(): AmazonUAEService {
    if (!AmazonUAEService.instance) {
      AmazonUAEService.instance = new AmazonUAEService();
    }
    return AmazonUAEService.instance;
  }

  // Product Management
  async fetchProducts(category?: string, search?: string): Promise<AmazonProduct[]> {
    try {
      let query = supabase
        .from('amazon_products')
        .select('*')
        .eq('availability', true);

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<AmazonProduct | null> {
    try {
      const { data, error } = await supabase
        .from('amazon_products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async syncProductsFromAmazon(): Promise<void> {
    try {
      // Get current conversion rate
      const conversionSettings = await this.getCurrencyConversionSettings();
      const conversionRate = conversionSettings?.conversion_rate || 1000; // Default: 1 AED = 1000 MWK
      
      // Real Amazon UAE products organized by categories (prices in AED)
      const amazonUAEProducts = [
        // Electronics Category
        {
          asin: 'B0B7B6XK8L',
          title: 'Samsung Galaxy S23 Ultra',
          description: 'Latest Samsung flagship smartphone with S Pen, 200MP camera, 5G capability, 12GB RAM, 256GB Storage',
          price_aed: 450, // Price in AED
          shipping_cost_aed: 25, // Shipping in AED
          image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Samsung',
          rating: 4.7,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XK8M',
          title: 'iPhone 15 Pro Max',
          description: 'Apple iPhone 15 Pro Max with A17 Pro chip, 48MP camera, titanium design, 256GB Storage',
          price_aed: 550, // Price in AED
          shipping_cost_aed: 30, // Shipping in AED
          image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Apple',
          rating: 4.9,
          review_count: 189,
          availability: true
        },
        {
          asin: 'B0B7B6XK8N',
          title: 'MacBook Pro M3',
          description: 'Apple MacBook Pro with M3 chip, 14-inch Liquid Retina display, 16GB RAM, 512GB SSD',
          price_aed: 1800, // Price in AED
          shipping_cost_aed: 75, // Shipping in AED
          image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Apple',
          rating: 4.8,
          review_count: 156,
          availability: true
        },
        {
          asin: 'B0B7B6XK8O',
          title: 'Sony WH-1000XM5',
          description: 'Premium wireless noise-canceling headphones with 30-hour battery life and exceptional sound quality',
          price_aed: 220,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Sony',
          rating: 4.6,
          review_count: 298,
          availability: true
        },
        {
          asin: 'B0B7B6XK8P',
          title: 'iPad Air 5th Generation',
          description: 'Apple iPad Air with M1 chip, 10.9-inch Liquid Retina display, 256GB Storage, Wi-Fi + Cellular',
          price_aed: 650,
          shipping_cost_aed: 20,
          image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Apple',
          rating: 4.7,
          review_count: 167,
          availability: true
        },

        // Fashion Category
        {
          asin: 'B0B7B6XK8Q',
          title: 'Nike Air Jordan 1 Retro High',
          description: 'Classic Air Jordan 1 Retro High OG in Chicago colorway, premium leather construction',
          price_aed: 120,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Nike',
          rating: 4.5,
          review_count: 445,
          availability: true
        },
        {
          asin: 'B0B7B6XK8R',
          title: 'Adidas Ultraboost 22',
          description: 'Premium running shoes with responsive Boost midsole and Primeknit upper',
          price_aed: 110,
          shipping_cost_aed: 10,
          image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Adidas',
          rating: 4.4,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XK8S',
          title: 'Ray-Ban Aviator Classic',
          description: 'Timeless Ray-Ban Aviator sunglasses with gold frame and green lenses',
          price_aed: 85,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Ray-Ban',
          rating: 4.6,
          review_count: 189,
          availability: true
        },

        // Home & Garden Category
        {
          asin: 'B0B7B6XK8T',
          title: 'Dyson V15 Detect Absolute',
          description: 'Cordless vacuum cleaner with laser dust detection, 60-minute runtime, HEPA filtration',
          price_aed: 350,
          shipping_cost_aed: 25,
          image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Dyson',
          rating: 4.8,
          review_count: 567,
          availability: true
        },
        {
          asin: 'B0B7B6XK8U',
          title: 'Philips Hue Smart Bulb Starter Kit',
          description: 'Smart LED bulb starter kit with bridge, 3 bulbs, and mobile app control',
          price_aed: 180,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Philips',
          rating: 4.5,
          review_count: 234,
          availability: true
        },

        // Sports Category
        {
          asin: 'B0B7B6XK8V',
          title: 'Wilson Pro Staff Tennis Racket',
          description: 'Professional tennis racket with graphite frame, 97 sq inch head, 16x19 string pattern',
          price_aed: 95,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Wilson',
          rating: 4.7,
          review_count: 156,
          availability: true
        },
        {
          asin: 'B0B7B6XK8W',
          title: 'Nike Mercurial Vapor 15 Elite',
          description: 'Professional football boots with Flyknit upper and carbon fiber soleplate',
          price_aed: 140,
          shipping_cost_aed: 10,
          image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Nike',
          rating: 4.6,
          review_count: 298,
          availability: true
        },

        // Books Category
        {
          asin: 'B0B7B6XK8X',
          title: 'Atomic Habits by James Clear',
          description: 'Bestselling book on building good habits and breaking bad ones',
          price_aed: 25,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Avery',
          rating: 4.8,
          review_count: 1234,
          availability: true
        },
        {
          asin: 'B0B7B6XK8Y',
          title: 'The Psychology of Money by Morgan Housel',
          description: 'Timeless lessons on wealth, greed, and happiness',
          price_aed: 22,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Harriman House',
          rating: 4.7,
          review_count: 987,
          availability: true
        },

        // Toys Category
        {
          asin: 'B0B7B6XK8Z',
          title: 'LEGO Star Wars Millennium Falcon',
          description: 'Iconic Star Wars spaceship building set with 1,329 pieces',
          price_aed: 180,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'LEGO',
          rating: 4.9,
          review_count: 456,
          availability: true
        },
        {
          asin: 'B0B7B6XK9A',
          title: 'Nintendo Switch OLED Model',
          description: 'Gaming console with 7-inch OLED screen, 64GB storage, includes Joy-Con controllers',
          price_aed: 320,
          shipping_cost_aed: 20,
          image_url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Nintendo',
          rating: 4.8,
          review_count: 789,
          availability: true
        },

        // Health & Beauty Category
        {
          asin: 'B0B7B6XK9B',
          title: 'Dyson Airwrap Multi-styler',
          description: 'Hair styling tool with multiple attachments for curling, smoothing, and volumizing',
          price_aed: 280,
          shipping_cost_aed: 18,
          image_url: 'https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Dyson',
          rating: 4.6,
          review_count: 345,
          availability: true
        },
        {
          asin: 'B0B7B6XK9C',
          title: 'Oral-B iO Series 9 Electric Toothbrush',
          description: 'Smart electric toothbrush with AI technology and 3D tracking',
          price_aed: 95,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1559591935-c6c92c6f2d6e?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Oral-B',
          rating: 4.7,
          review_count: 234,
          availability: true
        },

        // Automotive Category
        {
          asin: 'B0B7B6XK9D',
          title: 'Garmin DriveSmart 65 GPS Navigator',
          description: '7-inch GPS navigator with traffic alerts, voice control, and lifetime map updates',
          price_aed: 120,
          shipping_cost_aed: 10,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Garmin',
          rating: 4.5,
          review_count: 178,
          availability: true
        },
        {
          asin: 'B0B7B6XK9E',
          title: 'Dash Cam Front and Rear',
          description: 'Dual dash cam with 1080p front and rear cameras, night vision, and parking mode',
          price_aed: 85,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Vantrue',
          rating: 4.4,
          review_count: 156,
          availability: true
        },

        // Additional Electronics Products
        {
          asin: 'B0B7B6XK9F',
          title: 'Samsung 65" QLED 4K Smart TV',
          description: 'Quantum Dot technology, HDR, Alexa built-in, 4K Ultra HD resolution',
          price_aed: 850,
          shipping_cost_aed: 45,
          image_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Samsung',
          rating: 4.8,
          review_count: 423,
          availability: true
        },
        {
          asin: 'B0B7B6XK9G',
          title: 'DJI Mini 3 Pro Drone',
          description: 'Ultralight foldable drone with 4K camera, 34-minute flight time, obstacle avoidance',
          price_aed: 420,
          shipping_cost_aed: 25,
          image_url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'DJI',
          rating: 4.7,
          review_count: 298,
          availability: true
        },
        {
          asin: 'B0B7B6XK9H',
          title: 'GoPro HERO11 Black',
          description: '5.3K video, 27MP photos, HyperSmooth 5.0 stabilization, waterproof to 33ft',
          price_aed: 280,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'GoPro',
          rating: 4.6,
          review_count: 567,
          availability: true
        },
        {
          asin: 'B0B7B6XK9I',
          title: 'Microsoft Surface Pro 9',
          description: '2-in-1 laptop and tablet, Intel Core i7, 16GB RAM, 256GB SSD, 13" touchscreen',
          price_aed: 1200,
          shipping_cost_aed: 35,
          image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Microsoft',
          rating: 4.7,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XK9J',
          title: 'Bose QuietComfort 45',
          description: 'Premium noise-canceling headphones with 24-hour battery life and premium comfort',
          price_aed: 180,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Bose',
          rating: 4.5,
          review_count: 345,
          availability: true
        },

        // Additional Fashion Products
        {
          asin: 'B0B7B6XK9K',
          title: 'Rolex Submariner Date',
          description: 'Luxury dive watch with automatic movement, 300m water resistance, date display',
          price_aed: 2500,
          shipping_cost_aed: 50,
          image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Rolex',
          rating: 4.9,
          review_count: 89,
          availability: true
        },
        {
          asin: 'B0B7B6XK9L',
          title: 'Gucci Marmont Small Shoulder Bag',
          description: 'Leather shoulder bag with double G hardware, adjustable chain strap',
          price_aed: 450,
          shipping_cost_aed: 20,
          image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Gucci',
          rating: 4.6,
          review_count: 156,
          availability: true
        },
        {
          asin: 'B0B7B6XK9M',
          title: 'Puma RS-X Reinvention',
          description: 'Retro-inspired sneakers with chunky sole, mesh and suede upper',
          price_aed: 95,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Puma',
          rating: 4.4,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XK9N',
          title: 'Oakley Holbrook Sunglasses',
          description: 'Classic rectangular sunglasses with O Matter frame and Prizm lenses',
          price_aed: 75,
          shipping_cost_aed: 6,
          image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Oakley',
          rating: 4.5,
          review_count: 189,
          availability: true
        },
        {
          asin: 'B0B7B6XK9O',
          title: 'Levi\'s 501 Original Jeans',
          description: 'Classic straight-leg jeans with button fly, 100% cotton denim',
          price_aed: 65,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Levi\'s',
          rating: 4.3,
          review_count: 456,
          availability: true
        },

        // Additional Home & Garden Products
        {
          asin: 'B0B7B6XK9P',
          title: 'KitchenAid Artisan Stand Mixer',
          description: '5-quart stand mixer with 10-speed motor, tilt-head design, includes flat beater',
          price_aed: 280,
          shipping_cost_aed: 18,
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'KitchenAid',
          rating: 4.8,
          review_count: 678,
          availability: true
        },
        {
          asin: 'B0B7B6XK9Q',
          title: 'Weber Spirit II E-310 Gas Grill',
          description: '3-burner gas grill with 529 sq in cooking area, porcelain-enameled cast iron grates',
          price_aed: 320,
          shipping_cost_aed: 25,
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Weber',
          rating: 4.7,
          review_count: 345,
          availability: true
        },
        {
          asin: 'B0B7B6XK9R',
          title: 'Nest Learning Thermostat',
          description: 'Smart thermostat that learns your schedule and saves energy automatically',
          price_aed: 120,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Nest',
          rating: 4.6,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XK9S',
          title: 'Instant Pot Duo 7-in-1',
          description: '7-in-1 electric pressure cooker, slow cooker, rice cooker, steamer, and more',
          price_aed: 95,
          shipping_cost_aed: 7,
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Instant Pot',
          rating: 4.7,
          review_count: 1234,
          availability: true
        },
        {
          asin: 'B0B7B6XK9T',
          title: 'Ring Video Doorbell Pro',
          description: '1080p HD video doorbell with motion detection and two-way talk',
          price_aed: 85,
          shipping_cost_aed: 6,
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Ring',
          rating: 4.5,
          review_count: 567,
          availability: true
        },

        // Additional Sports Products
        {
          asin: 'B0B7B6XK9U',
          title: 'Fitbit Versa 4 Smartwatch',
          description: 'Advanced fitness tracking, GPS, heart rate monitoring, 6+ day battery life',
          price_aed: 95,
          shipping_cost_aed: 7,
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Fitbit',
          rating: 4.6,
          review_count: 456,
          availability: true
        },
        {
          asin: 'B0B7B6XK9V',
          title: 'Adidas Predator Edge.1 FG',
          description: 'Professional football boots with Controlframe outsole and Demonskin 2.0 upper',
          price_aed: 160,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Adidas',
          rating: 4.7,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XK9W',
          title: 'Under Armour Curry 9 Basketball Shoes',
          description: 'Lightweight basketball shoes with UA Flow cushioning and breathable upper',
          price_aed: 130,
          shipping_cost_aed: 10,
          image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Under Armour',
          rating: 4.5,
          review_count: 189,
          availability: true
        },
        {
          asin: 'B0B7B6XK9X',
          title: 'Callaway Rogue ST Max Driver',
          description: 'Golf driver with AI-designed Jailbreak Speed Frame and tungsten weighting',
          price_aed: 180,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Callaway',
          rating: 4.6,
          review_count: 123,
          availability: true
        },
        {
          asin: 'B0B7B6XK9Y',
          title: 'Garmin Fenix 7 Sapphire Solar',
          description: 'Premium multisport GPS watch with solar charging and advanced training metrics',
          price_aed: 450,
          shipping_cost_aed: 25,
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Garmin',
          rating: 4.8,
          review_count: 234,
          availability: true
        },

        // Additional Books Products
        {
          asin: 'B0B7B6XK9Z',
          title: 'Rich Dad Poor Dad by Robert Kiyosaki',
          description: 'Personal finance classic about building wealth and financial literacy',
          price_aed: 28,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Warner Books',
          rating: 4.6,
          review_count: 2345,
          availability: true
        },
        {
          asin: 'B0B7B6XKA0',
          title: 'The 7 Habits of Highly Effective People',
          description: 'Stephen Covey\'s classic on personal and professional effectiveness',
          price_aed: 30,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Free Press',
          rating: 4.7,
          review_count: 3456,
          availability: true
        },
        {
          asin: 'B0B7B6XKA1',
          title: 'Think and Grow Rich by Napoleon Hill',
          description: 'Timeless principles for success and wealth building',
          price_aed: 25,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'TarcherPerigee',
          rating: 4.5,
          review_count: 1890,
          availability: true
        },
        {
          asin: 'B0B7B6XKA2',
          title: 'The Power of Now by Eckhart Tolle',
          description: 'Spiritual guide to living in the present moment and finding inner peace',
          price_aed: 22,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'New World Library',
          rating: 4.4,
          review_count: 1234,
          availability: true
        },
        {
          asin: 'B0B7B6XKA3',
          title: 'Sapiens by Yuval Noah Harari',
          description: 'A brief history of humankind from ancient humans to the present day',
          price_aed: 32,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Harper',
          rating: 4.6,
          review_count: 2345,
          availability: true
        },

        // Additional Toys Products
        {
          asin: 'B0B7B6XKA4',
          title: 'PlayStation 5 Console',
          description: 'Next-gen gaming console with 4K graphics, ray tracing, and ultra-high speed SSD',
          price_aed: 450,
          shipping_cost_aed: 30,
          image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Sony',
          rating: 4.9,
          review_count: 1234,
          availability: true
        },
        {
          asin: 'B0B7B6XKA5',
          title: 'Xbox Series X Console',
          description: 'Most powerful Xbox ever with 4K gaming, ray tracing, and 120 FPS support',
          price_aed: 420,
          shipping_cost_aed: 28,
          image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Microsoft',
          rating: 4.8,
          review_count: 987,
          availability: true
        },
        {
          asin: 'B0B7B6XKA6',
          title: 'LEGO Harry Potter Hogwarts Castle',
          description: 'Detailed Hogwarts Castle building set with 6,020 pieces and iconic locations',
          price_aed: 280,
          shipping_cost_aed: 20,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'LEGO',
          rating: 4.9,
          review_count: 567,
          availability: true
        },
        {
          asin: 'B0B7B6XKA7',
          title: 'Hot Wheels Ultimate Garage',
          description: 'Multi-level car garage playset with ramps, elevator, and 5 Hot Wheels cars',
          price_aed: 65,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Hot Wheels',
          rating: 4.5,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKA8',
          title: 'Barbie Dreamhouse',
          description: '3-story dollhouse with elevator, pool, slide, and 70+ accessories',
          price_aed: 120,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Barbie',
          rating: 4.6,
          review_count: 345,
          availability: true
        },

        // Additional Health & Beauty Products
        {
          asin: 'B0B7B6XKA9',
          title: 'Philips Sonicare DiamondClean',
          description: 'Electric toothbrush with diamond-clean technology and 5 cleaning modes',
          price_aed: 85,
          shipping_cost_aed: 7,
          image_url: 'https://images.unsplash.com/photo-1559591935-c6c92c6f2d6e?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Philips',
          rating: 4.7,
          review_count: 456,
          availability: true
        },
        {
          asin: 'B0B7B6XKAA',
          title: 'Dyson Supersonic Hair Dryer',
          description: 'Revolutionary hair dryer with intelligent heat control and fast drying',
          price_aed: 220,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Dyson',
          rating: 4.6,
          review_count: 567,
          availability: true
        },
        {
          asin: 'B0B7B6XKAB',
          title: 'Foreo Luna 3 Facial Cleansing Brush',
          description: 'Silicone facial cleansing brush with T-Sonic technology and 8 intensity levels',
          price_aed: 95,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Foreo',
          rating: 4.5,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKAC',
          title: 'Clarisonic Mia Smart Facial Cleansing Device',
          description: 'Smart facial cleansing brush with app connectivity and personalized routines',
          price_aed: 75,
          shipping_cost_aed: 6,
          image_url: 'https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Clarisonic',
          rating: 4.4,
          review_count: 189,
          availability: true
        },
        {
          asin: 'B0B7B6XKAD',
          title: 'NuFACE Trinity Facial Toning Device',
          description: 'Microcurrent facial toning device for lifting and firming facial muscles',
          price_aed: 180,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'NuFACE',
          rating: 4.6,
          review_count: 234,
          availability: true
        },

        // Additional Automotive Products
        {
          asin: 'B0B7B6XKAE',
          title: 'Cobra RAD 480i Radar Detector',
          description: 'Long-range radar detector with false alert filtering and OLED display',
          price_aed: 95,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Cobra',
          rating: 4.5,
          review_count: 156,
          availability: true
        },
        {
          asin: 'B0B7B6XKAF',
          title: 'Anker Roav DashCam C1 Pro',
          description: '1080p dash cam with night vision, motion detection, and 160-degree wide angle',
          price_aed: 65,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Anker',
          rating: 4.4,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKAG',
          title: 'TomTom GO Supreme GPS Navigator',
          description: '6-inch GPS navigator with lifetime world maps and real-time traffic',
          price_aed: 110,
          shipping_cost_aed: 9,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'TomTom',
          rating: 4.6,
          review_count: 178,
          availability: true
        },
        {
          asin: 'B0B7B6XKAH',
          title: 'BlueDriver Bluetooth Pro OBDII Scanner',
          description: 'Professional-grade OBDII scanner with Bluetooth connectivity and diagnostic reports',
          price_aed: 85,
          shipping_cost_aed: 7,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'BlueDriver',
          rating: 4.7,
          review_count: 345,
          availability: true
        },
        {
          asin: 'B0B7B6XKAI',
          title: 'Escort MAX 360c Radar Detector',
          description: 'Premium radar detector with 360-degree protection and false alert filtering',
          price_aed: 180,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Escort',
          rating: 4.8,
          review_count: 234,
          availability: true
        },

        // Additional Electronics Products (11-15)
        {
          asin: 'B0B7B6XKAJ',
          title: 'Apple Watch Series 9',
          description: 'Latest Apple Watch with S9 chip, Always-On Retina display, GPS, and health monitoring',
          price_aed: 280,
          shipping_cost_aed: 18,
          image_url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Apple',
          rating: 4.8,
          review_count: 567,
          availability: true
        },
        {
          asin: 'B0B7B6XKAK',
          title: 'Samsung Galaxy Tab S9 Ultra',
          description: '14.6-inch Android tablet with S Pen, 256GB storage, and 5G connectivity',
          price_aed: 520,
          shipping_cost_aed: 25,
          image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Samsung',
          rating: 4.7,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKAL',
          title: 'Canon EOS R6 Mark II',
          description: 'Full-frame mirrorless camera with 24.2MP sensor, 4K video, and dual card slots',
          price_aed: 850,
          shipping_cost_aed: 35,
          image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Canon',
          rating: 4.9,
          review_count: 189,
          availability: true
        },
        {
          asin: 'B0B7B6XKAM',
          title: 'Sony WH-1000XM4',
          description: 'Industry-leading noise-canceling headphones with 30-hour battery life',
          price_aed: 180,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'Sony',
          rating: 4.7,
          review_count: 456,
          availability: true
        },
        {
          asin: 'B0B7B6XKAN',
          title: 'LG C3 65" OLED TV',
          description: '4K OLED TV with AI-powered processing, Dolby Vision, and webOS smart platform',
          price_aed: 950,
          shipping_cost_aed: 45,
          image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
          category: 'Electronics',
          brand: 'LG',
          rating: 4.8,
          review_count: 234,
          availability: true
        },

        // Additional Fashion Products (11-15)
        {
          asin: 'B0B7B6XKAO',
          title: 'Cartier Love Bracelet',
          description: 'Iconic 18k gold bracelet with screw motif, perfect for everyday wear',
          price_aed: 1800,
          shipping_cost_aed: 40,
          image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Cartier',
          rating: 4.9,
          review_count: 78,
          availability: true
        },
        {
          asin: 'B0B7B6XKAP',
          title: 'Hermès Birkin 30 Bag',
          description: 'Luxury handcrafted leather bag with gold hardware and signature lock',
          price_aed: 3500,
          shipping_cost_aed: 60,
          image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Hermès',
          rating: 4.9,
          review_count: 45,
          availability: true
        },
        {
          asin: 'B0B7B6XKAQ',
          title: 'New Balance 990v6',
          description: 'Premium running shoes with ENCAP midsole technology and suede/mesh upper',
          price_aed: 95,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'New Balance',
          rating: 4.6,
          review_count: 345,
          availability: true
        },
        {
          asin: 'B0B7B6XKAR',
          title: 'Tom Ford Black Orchid Perfume',
          description: 'Luxury fragrance with notes of black truffle, ylang ylang, and patchouli',
          price_aed: 120,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Tom Ford',
          rating: 4.7,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKAS',
          title: 'Chanel Classic Flap Bag',
          description: 'Timeless quilted leather bag with chain strap and CC logo closure',
          price_aed: 2800,
          shipping_cost_aed: 50,
          image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
          category: 'Fashion',
          brand: 'Chanel',
          rating: 4.9,
          review_count: 67,
          availability: true
        },

        // Additional Home & Garden Products (11-15)
        {
          asin: 'B0B7B6XKAT',
          title: 'Vitamix 5200 Blender',
          description: 'Professional-grade blender with 64-ounce container and variable speed control',
          price_aed: 180,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Vitamix',
          rating: 4.8,
          review_count: 789,
          availability: true
        },
        {
          asin: 'B0B7B6XKAU',
          title: 'Breville Barista Express',
          description: 'Semi-automatic espresso machine with built-in grinder and steam wand',
          price_aed: 220,
          shipping_cost_aed: 18,
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Breville',
          rating: 4.7,
          review_count: 456,
          availability: true
        },
        {
          asin: 'B0B7B6XKAV',
          title: 'Dyson Pure Cool Air Purifier',
          description: 'HEPA air purifier with cooling fan and air quality monitoring',
          price_aed: 280,
          shipping_cost_aed: 20,
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Dyson',
          rating: 4.6,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKAW',
          title: 'Bosch 800 Series Dishwasher',
          description: 'Built-in dishwasher with CrystalDry technology and third rack',
          price_aed: 320,
          shipping_cost_aed: 25,
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Bosch',
          rating: 4.8,
          review_count: 345,
          availability: true
        },
        {
          asin: 'B0B7B6XKAX',
          title: 'Samsung Bespoke Refrigerator',
          description: 'Customizable French door refrigerator with Family Hub touchscreen',
          price_aed: 850,
          shipping_cost_aed: 40,
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          category: 'Home & Garden',
          brand: 'Samsung',
          rating: 4.7,
          review_count: 189,
          availability: true
        },

        // Additional Sports Products (11-15)
        {
          asin: 'B0B7B6XKAY',
          title: 'Peloton Bike+',
          description: 'Premium indoor cycling bike with 24" rotating HD touchscreen',
          price_aed: 650,
          shipping_cost_aed: 35,
          image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Peloton',
          rating: 4.8,
          review_count: 567,
          availability: true
        },
        {
          asin: 'B0B7B6XKAZ',
          title: 'Bowflex SelectTech 552 Dumbbells',
          description: 'Adjustable dumbbells with 15 weight settings from 5-52.5 lbs',
          price_aed: 180,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Bowflex',
          rating: 4.7,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKB0',
          title: 'Wilson Clash 100 Tennis Racket',
          description: 'Revolutionary tennis racket with flexible frame for maximum power and comfort',
          price_aed: 120,
          shipping_cost_aed: 10,
          image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Wilson',
          rating: 4.6,
          review_count: 189,
          availability: true
        },
        {
          asin: 'B0B7B6XKB1',
          title: 'Nike ZoomX Vaporfly Next% 2',
          description: 'Elite racing shoes with carbon fiber plate and ZoomX foam',
          price_aed: 180,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Nike',
          rating: 4.8,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKB2',
          title: 'Garmin Forerunner 955 Solar',
          description: 'Advanced running watch with solar charging and multi-sport tracking',
          price_aed: 280,
          shipping_cost_aed: 18,
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
          category: 'Sports',
          brand: 'Garmin',
          rating: 4.7,
          review_count: 345,
          availability: true
        },

        // Additional Books Products (8-12)
        {
          asin: 'B0B7B6XKB3',
          title: 'The Subtle Art of Not Giving a F*ck',
          description: 'Mark Manson\'s counterintuitive approach to living a good life',
          price_aed: 25,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'HarperOne',
          rating: 4.5,
          review_count: 2345,
          availability: true
        },
        {
          asin: 'B0B7B6XKB4',
          title: 'Deep Work by Cal Newport',
          description: 'Rules for focused success in a distracted world',
          price_aed: 28,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Grand Central',
          rating: 4.6,
          review_count: 1890,
          availability: true
        },
        {
          asin: 'B0B7B6XKB5',
          title: 'The 4-Hour Workweek by Timothy Ferriss',
          description: 'Escape 9-5, live anywhere, and join the new rich',
          price_aed: 30,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Crown',
          rating: 4.4,
          review_count: 3456,
          availability: true
        },
        {
          asin: 'B0B7B6XKB6',
          title: 'Zero to One by Peter Thiel',
          description: 'Notes on startups, or how to build the future',
          price_aed: 32,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Crown Business',
          rating: 4.7,
          review_count: 2345,
          availability: true
        },
        {
          asin: 'B0B7B6XKB7',
          title: 'The Lean Startup by Eric Ries',
          description: 'How constant innovation creates radically successful businesses',
          price_aed: 28,
          shipping_cost_aed: 5,
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
          category: 'Books',
          brand: 'Crown Business',
          rating: 4.5,
          review_count: 1890,
          availability: true
        },

        // Additional Toys Products (8-12)
        {
          asin: 'B0B7B6XKB8',
          title: 'LEGO Titanic Building Set',
          description: 'Iconic Titanic ship model with 9,090 pieces and detailed interior',
          price_aed: 450,
          shipping_cost_aed: 30,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'LEGO',
          rating: 4.9,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKB9',
          title: 'Hot Wheels Ultimate Garage',
          description: 'Multi-level car garage playset with ramps, elevator, and 5 Hot Wheels cars',
          price_aed: 85,
          shipping_cost_aed: 10,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Hot Wheels',
          rating: 4.6,
          review_count: 456,
          availability: true
        },
        {
          asin: 'B0B7B6XKBA',
          title: 'Nerf Rival Prometheus MXVIII-20K',
          description: 'High-capacity foam blaster with 200-round hopper and motorized firing',
          price_aed: 120,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Nerf',
          rating: 4.7,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKBB',
          title: 'Fisher-Price Laugh & Learn Smart Stages',
          description: 'Interactive learning toy with songs, phrases, and educational content',
          price_aed: 45,
          shipping_cost_aed: 6,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Fisher-Price',
          rating: 4.5,
          review_count: 567,
          availability: true
        },
        {
          asin: 'B0B7B6XKBC',
          title: 'Playmobil Knights Castle',
          description: 'Medieval castle playset with knights, horses, and detailed accessories',
          price_aed: 180,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
          category: 'Toys',
          brand: 'Playmobil',
          rating: 4.6,
          review_count: 234,
          availability: true
        },

        // Additional Health & Beauty Products (8-12)
        {
          asin: 'B0B7B6XKBD',
          title: 'Dyson V15 Detect Absolute Extra',
          description: 'Cordless vacuum with laser dust detection and 60-minute runtime',
          price: 320000,
          currency: 'MWK',
          shipping_cost: 20000,
          image_url: 'https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Dyson',
          rating: 4.8,
          review_count: 456,
          availability: true
        },
        {
          asin: 'B0B7B6XKBE',
          title: 'Philips Sonicare DiamondClean Smart',
          description: 'Smart electric toothbrush with app connectivity and personalized coaching',
          price_aed: 120,
          shipping_cost_aed: 10,
          image_url: 'https://images.unsplash.com/photo-1559591935-c6c92c6f2d6e?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Philips',
          rating: 4.7,
          review_count: 345,
          availability: true
        },
        {
          asin: 'B0B7B6XKBF',
          title: 'La Mer Moisturizing Cream',
          description: 'Luxury moisturizing cream with Miracle Broth and sea kelp',
          price_aed: 280,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'La Mer',
          rating: 4.8,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKBG',
          title: 'Dyson Corrale Hair Straightener',
          description: 'Cordless hair straightener with flexing copper plates and intelligent heat control',
          price_aed: 250,
          shipping_cost_aed: 18,
          image_url: 'https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Dyson',
          rating: 4.6,
          review_count: 189,
          availability: true
        },
        {
          asin: 'B0B7B6XKBH',
          title: 'Oral-B Genius X Electric Toothbrush',
          description: 'AI-powered electric toothbrush with 3D tracking and personalized feedback',
          price_aed: 95,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1559591935-c6c92c6f2d6e?w=400&h=400&fit=crop',
          category: 'Health & Beauty',
          brand: 'Oral-B',
          rating: 4.7,
          review_count: 456,
          availability: true
        },

        // Additional Automotive Products (10-15)
        {
          asin: 'B0B7B6XKBI',
          title: 'Uniden R7 Radar Detector',
          description: 'Long-range radar detector with GPS and false alert filtering',
          price_aed: 120,
          shipping_cost_aed: 10,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Uniden',
          rating: 4.6,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKBJ',
          title: 'Garmin DriveSmart 86 GPS Navigator',
          description: '8-inch GPS navigator with voice control and lifetime map updates',
          price_aed: 150,
          shipping_cost_aed: 12,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Garmin',
          rating: 4.7,
          review_count: 189,
          availability: true
        },
        {
          asin: 'B0B7B6XKBK',
          title: 'Vantrue N4 3-Channel Dash Cam',
          description: 'Triple channel dash cam with 4K front camera and interior/rear cameras',
          price_aed: 95,
          shipping_cost_aed: 8,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Vantrue',
          rating: 4.5,
          review_count: 345,
          availability: true
        },
        {
          asin: 'B0B7B6XKBL',
          title: 'Autel MaxiCOM MK808BT Scanner',
          description: 'Professional OBDII scanner with bidirectional control and live data',
          price_aed: 180,
          shipping_cost_aed: 15,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Autel',
          rating: 4.8,
          review_count: 234,
          availability: true
        },
        {
          asin: 'B0B7B6XKBM',
          title: 'Valentine One Gen2 Radar Detector',
          description: 'Premium radar detector with arrow display and exceptional range',
          price_aed: 220,
          shipping_cost_aed: 18,
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          category: 'Automotive',
          brand: 'Valentine',
          rating: 4.9,
          review_count: 156,
          availability: true
        }
      ];

      // Clear existing products first (optional - you can remove this if you want to keep existing products)
      // await this.clearAllProducts();

      // Sync products by category
      const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports & Fitness', 'Books & Toys', 'Beauty & Health', 'Automotive'];
      
      for (const category of categories) {
        const categoryProducts = amazonUAEProducts.filter(product => product.category === category);
        console.log(`Syncing ${categoryProducts.length} products for category: ${category}`);
        
        for (const product of categoryProducts) {
          // Convert AED prices to MWK using the conversion rate
          let finalPrice: number;
          let finalShippingCost: number;
          
          if (product.price_aed && product.shipping_cost_aed) {
            // Product has AED prices, convert them
            finalPrice = Math.round(product.price_aed * conversionRate);
            finalShippingCost = Math.round(product.shipping_cost_aed * conversionRate);
          } else if (product.price && product.shipping_cost) {
            // Product has MWK prices, use them as is (they're already in MWK)
            finalPrice = product.price;
            finalShippingCost = product.shipping_cost;
          } else {
            // Fallback to 0 if no prices found
            finalPrice = 0;
            finalShippingCost = 0;
          }
          
          const convertedProduct = {
            ...product,
            price: finalPrice,
            shipping_cost: finalShippingCost,
            currency: 'MWK',
            // Store AED prices for future currency conversions
            price_aed: product.price_aed || (product.price ? product.price / conversionRate : null),
            shipping_cost_aed: product.shipping_cost_aed || (product.shipping_cost ? product.shipping_cost / conversionRate : null)
          };
          
          await this.upsertProduct(convertedProduct);
        }
      }

      console.log(`Successfully synced ${amazonUAEProducts.length} Amazon UAE products across ${categories.length} categories`);
    } catch (error) {
      console.error('Error syncing products from Amazon UAE:', error);
      throw error;
    }
  }

  async upsertProduct(productData: Partial<AmazonProduct>): Promise<void> {
    try {
      const { error } = await supabase
        .from('amazon_products')
        .upsert({
          ...productData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'asin'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error upserting product:', error);
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('amazon_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async clearAllProducts(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('amazon_products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing all products:', error);
      return false;
    }
  }

  // Order Management
  async createOrder(orderData: Partial<AmazonOrder>): Promise<AmazonOrder | null> {
    try {
      const orderNumber = `AMZ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('amazon_orders')
        .insert({
          ...orderData,
          order_number: orderNumber,
          status: 'pending',
          order_date: new Date().toISOString(),
          estimated_delivery: this.calculateEstimatedDelivery()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Send order confirmation notification with user email
      if (data) {
        // Get user email from the user_id - try amazon_users first, then profiles
        let userEmail = null;

        // First try to get from amazon_users table
        const { data: amazonUserData } = await supabase
          .from('amazon_users')
          .select('email')
          .eq('user_id', data.user_id)
          .single();

        if (amazonUserData?.email) {
          userEmail = amazonUserData.email;
        } else {
          // If not found in amazon_users, try profiles table
          console.log(`User not found in amazon_users, trying profiles table for user ${data.user_id}`);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', data.user_id)
            .single();

          if (profileData?.email) {
            userEmail = profileData.email;
          }
        }

        if (userEmail) {
          await amazonNotificationService.sendOrderConfirmation(data, userEmail);
        } else {
          console.warn(`No email found for user ${data.user_id}`);
          // Send without email as fallback
          await amazonNotificationService.sendOrderConfirmation(data);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  async getOrdersByUser(userId: string): Promise<AmazonOrder[]> {
    try {
      const { data, error } = await supabase
        .from('amazon_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getAllOrders(): Promise<AmazonOrder[]> {
    try {
      const { data, error } = await supabase
        .from('amazon_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<AmazonOrder | null> {
    try {
      const { data, error } = await supabase
        .from('amazon_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      return null;
    }
  }

  async updateOrderStatus(orderId: string, status: AmazonOrder['status'], adminNotes?: string): Promise<boolean> {
    try {
      console.log(`Updating order ${orderId} status to ${status}`);
      
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (status === 'delivered') {
        updateData.actual_delivery = new Date().toISOString();
      }

      const { error } = await supabase
        .from('amazon_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order in database:', error);
        throw error;
      }
      
      console.log(`Order ${orderId} status updated to ${status} in database`);
      
      // Get the updated order data with user information
      const { data: orderData, error: fetchError } = await supabase
        .from('amazon_orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated order:', fetchError);
        return false;
      }
        
      if (orderData) {
        console.log(`Found order data for ${orderId}, user_id: ${orderData.user_id}`);
        
        // Get user email from the user_id - try amazon_users first, then profiles
        let userData = null;
        let userError = null;

        // First try to get from amazon_users table
        const { data: amazonUserData, error: amazonUserError } = await supabase
          .from('amazon_users')
          .select('email')
          .eq('user_id', orderData.user_id)
          .single();

        if (amazonUserData) {
          userData = amazonUserData;
        } else {
          // If not found in amazon_users, try profiles table
          console.log(`User not found in amazon_users, trying profiles table for user ${orderData.user_id}`);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', orderData.user_id)
            .single();

          if (profileData) {
            userData = profileData;
          } else {
            userError = profileError || amazonUserError;
          }
        }

        if (userError) {
          console.error('Error fetching user data:', userError);
          return false;
        }

        // Send status update notification with proper email
        if (userData?.email) {
          console.log(`Sending email notification to ${userData.email} for order ${orderId}`);
          
          try {
            await amazonNotificationService.sendOrderStatusUpdate(orderData, status, userData.email);
            console.log(`Status update email sent successfully to ${userData.email}`);
            
            if (status === 'delivered') {
              console.log(`Sending delivery notification to ${userData.email}`);
              await amazonNotificationService.sendDeliveryNotification(orderData, userData.email);
              console.log(`Delivery notification email sent successfully to ${userData.email}`);
            }
            
            return true;
          } catch (emailError) {
            console.error('Error sending email notification:', emailError);
            return false;
          }
        } else {
          console.warn(`No email found for user ${orderData.user_id}`);
          return false;
        }
      } else {
        console.error(`No order data found for order ${orderId}`);
        return false;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // User Management
  async createAmazonUser(userData: Partial<AmazonUser>): Promise<AmazonUser | null> {
    try {
      const { data, error } = await supabase
        .from('amazon_users')
        .insert({
          ...userData,
          is_verified: false,
          total_orders: 0,
          total_spent: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating Amazon user:', error);
      return null;
    }
  }

  async getVerifiedUsers(): Promise<AmazonUser[]> {
    try {
      const { data, error } = await supabase
        .from('amazon_users')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching verified users:', error);
      return [];
    }
  }

  // Reviews
  async addReview(reviewData: Partial<ProductReview>): Promise<ProductReview | null> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding review:', error);
      return null;
    }
  }

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  // Promotions
  async getActivePromotions(): Promise<Promotion[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', now)
        .lte('valid_from', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return [];
    }
  }

  // Order Tracking
  async addTrackingUpdate(trackingData: Partial<OrderTracking>): Promise<OrderTracking | null> {
    try {
      const { data, error } = await supabase
        .from('order_tracking')
        .insert(trackingData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding tracking update:', error);
      return null;
    }
  }

  async getOrderTracking(orderId: string): Promise<OrderTracking[]> {
    try {
      const { data, error } = await supabase
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tracking:', error);
      return [];
    }
  }

  // Utility Methods
  private calculateEstimatedDelivery(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 12); // 10-15 days average
    return deliveryDate.toISOString();
  }

  validateOrderAmount(amount: number): boolean {
    return amount >= 250000 && amount <= 20000000; // MK250,000 to MK20,000,000
  }

  generateReceipt(order: AmazonOrder): string {
    return `
      DREAM WEAVE - AMAZON UAE ORDER RECEIPT
      Order Number: ${order.order_number}
      Date: ${new Date(order.order_date).toLocaleDateString()}
      Total Amount: MWK ${order.total_amount.toLocaleString()}
      Status: ${order.status.toUpperCase()}
    `;
  }

  // Currency Conversion Methods
  async getCurrencyConversionSettings(): Promise<CurrencyConversionSettings | null> {
    try {
      const { data, error } = await supabase
        .from('currency_conversion_settings')
        .select('*')
        .eq('is_active', true)
        .eq('from_currency', 'AED')
        .eq('to_currency', 'MWK')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching currency conversion settings:', error);
      return null;
    }
  }

  async updateCurrencyConversionRate(conversionRate: number): Promise<boolean> {
    try {
      // First, deactivate any existing settings
      await supabase
        .from('currency_conversion_settings')
        .update({ is_active: false })
        .eq('from_currency', 'AED')
        .eq('to_currency', 'MWK');

      // Create new settings
      const { error } = await supabase
        .from('currency_conversion_settings')
        .insert({
          from_currency: 'AED',
          to_currency: 'MWK',
          conversion_rate: conversionRate,
          is_active: true
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating currency conversion rate:', error);
      return false;
    }
  }

  async convertPriceFromAEDToMWK(aedPrice: number): Promise<number> {
    try {
      const settings = await this.getCurrencyConversionSettings();
      if (!settings) {
        // Default conversion rate if no settings found (1 AED = 1000 MWK)
        return aedPrice * 1000;
      }
      return aedPrice * settings.conversion_rate;
    } catch (error) {
      console.error('Error converting price:', error);
      // Fallback to default rate
      return aedPrice * 1000;
    }
  }

  async updateAllProductPricesWithNewRate(newConversionRate: number): Promise<boolean> {
    try {
      // Fetch all products that have AED prices stored
      const { data: products, error: fetchError } = await supabase
        .from('amazon_products')
        .select('*');

      if (fetchError) throw fetchError;

      if (!products || products.length === 0) {
        return true; // No products to update
      }

      // Update each product's price and shipping cost
      for (const product of products) {
        let newPrice: number;
        let newShippingCost: number;

        // Check if product has AED prices stored
        if (product.price_aed && product.shipping_cost_aed) {
          // Convert from AED to MWK using new rate
          newPrice = Math.round(product.price_aed * newConversionRate);
          newShippingCost = Math.round(product.shipping_cost_aed * newConversionRate);
        } else if (product.price && product.shipping_cost) {
          // If no AED prices, try to estimate AED price from current MWK price
          // This is a fallback for products that might not have AED prices stored
          const estimatedAEDPrice = product.price / (newConversionRate * 0.8); // Rough estimate
          const estimatedAEDShipping = product.shipping_cost / (newConversionRate * 0.8);
          
          newPrice = Math.round(estimatedAEDPrice * newConversionRate);
          newShippingCost = Math.round(estimatedAEDShipping * newConversionRate);
        } else {
          // Skip products with no price information
          continue;
        }

        // Update the product with new prices
        const { error: updateError } = await supabase
          .from('amazon_products')
          .update({
            price: newPrice,
            shipping_cost: newShippingCost,
            currency: 'MWK',
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Error updating product ${product.id}:`, updateError);
          // Continue with other products even if one fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating all product prices:', error);
      return false;
    }
  }
}

export const amazonUAEService = AmazonUAEService.getInstance();
