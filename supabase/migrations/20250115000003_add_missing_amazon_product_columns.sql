-- Add missing columns to amazon_products table for API integration

-- Add price_aed column for storing original AED prices
ALTER TABLE amazon_products 
ADD COLUMN IF NOT EXISTS price_aed DECIMAL(10,2);

-- Add shipping_cost_aed column for storing original AED shipping costs
ALTER TABLE amazon_products 
ADD COLUMN IF NOT EXISTS shipping_cost_aed DECIMAL(10,2);

-- Add product_url column for storing Amazon product URLs
ALTER TABLE amazon_products 
ADD COLUMN IF NOT EXISTS product_url TEXT;

-- Add notes column to amazon_orders table (referenced in the code)
ALTER TABLE amazon_orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing records to have default values
UPDATE amazon_products 
SET 
    price_aed = price / 1000, -- Convert MWK to AED (assuming 1000:1 rate)
    shipping_cost_aed = shipping_cost / 1000,
    product_url = 'https://amazon.ae/dp/' || asin
WHERE price_aed IS NULL OR shipping_cost_aed IS NULL OR product_url IS NULL;
