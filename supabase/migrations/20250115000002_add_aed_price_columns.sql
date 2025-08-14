-- Add AED price columns to amazon_products table for currency conversion
-- This allows us to store original AED prices and convert them to MWK

-- Add price_aed and shipping_cost_aed columns
ALTER TABLE amazon_products 
ADD COLUMN IF NOT EXISTS price_aed DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_cost_aed DECIMAL(10,2);

-- Add comments to explain the purpose of these columns
COMMENT ON COLUMN amazon_products.price_aed IS 'Original price in UAE Dirhams (AED) for currency conversion';
COMMENT ON COLUMN amazon_products.shipping_cost_aed IS 'Original shipping cost in UAE Dirhams (AED) for currency conversion';

-- Create index for better performance when querying by AED prices
CREATE INDEX IF NOT EXISTS idx_amazon_products_price_aed ON amazon_products(price_aed) WHERE price_aed IS NOT NULL;
