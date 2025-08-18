-- Add size and color columns to amazon_products table for fashion products

-- Add size column for storing available sizes
ALTER TABLE amazon_products 
ADD COLUMN IF NOT EXISTS size TEXT;

-- Add color column for storing available colors
ALTER TABLE amazon_products 
ADD COLUMN IF NOT EXISTS color TEXT;

-- Add index for better performance when filtering by category
CREATE INDEX IF NOT EXISTS idx_amazon_products_category ON amazon_products(category);

-- Add index for better performance when filtering by size and color
CREATE INDEX IF NOT EXISTS idx_amazon_products_size_color ON amazon_products(size, color);
