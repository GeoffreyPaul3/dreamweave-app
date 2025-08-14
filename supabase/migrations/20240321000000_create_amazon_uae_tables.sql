-- Create Amazon UAE integration tables

-- Amazon Products Table
CREATE TABLE IF NOT EXISTS amazon_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asin VARCHAR(20) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MWK',
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    image_url TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    availability BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amazon Users Table (extends existing profiles)
CREATE TABLE IF NOT EXISTS amazon_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address JSONB NOT NULL, -- {address_line1, address_line2, city, postal_code, country}
    is_verified BOOLEAN DEFAULT false,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Amazon Orders Table
CREATE TABLE IF NOT EXISTS amazon_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES amazon_products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    product_price DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'successful', 'cancelled')),
    delivery_address JSONB NOT NULL, -- {full_name, phone, address_line1, address_line2, city, postal_code, country}
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    tracking_number VARCHAR(100),
    admin_notes TEXT,
    paychangu_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES amazon_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2) NOT NULL,
    minimum_order DECIMAL(12,2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Tracking Table
CREATE TABLE IF NOT EXISTS order_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES amazon_orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(200),
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_amazon_products_category ON amazon_products(category);
CREATE INDEX IF NOT EXISTS idx_amazon_products_availability ON amazon_products(availability);
CREATE INDEX IF NOT EXISTS idx_amazon_orders_user_id ON amazon_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_amazon_orders_status ON amazon_orders(status);
CREATE INDEX IF NOT EXISTS idx_amazon_orders_order_date ON amazon_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, valid_from, valid_until);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_amazon_products_updated_at BEFORE UPDATE ON amazon_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_amazon_users_updated_at BEFORE UPDATE ON amazon_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_amazon_orders_updated_at BEFORE UPDATE ON amazon_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO amazon_products (asin, title, description, price, shipping_cost, image_url, category, brand, rating, review_count) VALUES
('B08N5WRWNW', 'Samsung Galaxy S21', 'Latest Samsung smartphone with advanced features, 8GB RAM, 128GB Storage, 5G capable', 250000, 15000, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop', 'Electronics', 'Samsung', 4.5, 120),
('B09G9HD6PD', 'iPhone 13 Pro', 'Apple iPhone 13 Pro with advanced camera system, A15 Bionic chip, 256GB Storage', 350000, 20000, 'https://images.unsplash.com/photo-1632661674596-6e75d8b5c4b8?w=400&h=400&fit=crop', 'Electronics', 'Apple', 4.8, 95),
('B08N5WRWNW', 'MacBook Air M1', 'Apple MacBook Air with M1 chip, 8GB RAM, 256GB SSD, 13-inch Retina display', 1200000, 50000, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', 'Electronics', 'Apple', 4.9, 78),
('B08N5WRWNW', 'Sony WH-1000XM4', 'Wireless noise-canceling headphones with 30-hour battery life', 180000, 12000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 'Electronics', 'Sony', 4.6, 156),
('B08N5WRWNW', 'Nike Air Max 270', 'Comfortable running shoes with Air Max technology', 85000, 8000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 'Fashion', 'Nike', 4.3, 89),
('B08N5WRWNW', 'Adidas Ultraboost 21', 'Premium running shoes with responsive cushioning', 95000, 8000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop', 'Fashion', 'Adidas', 4.4, 67)
ON CONFLICT (asin) DO NOTHING;

-- Insert sample promotions
INSERT INTO promotions (title, description, discount_percentage, minimum_order, valid_until) VALUES
('New Customer Discount', 'Get 10% off your first order', 10.00, 500000, NOW() + INTERVAL '30 days'),
('Bulk Order Discount', 'Get 15% off orders above MWK 1,000,000', 15.00, 1000000, NOW() + INTERVAL '60 days')
ON CONFLICT DO NOTHING;
