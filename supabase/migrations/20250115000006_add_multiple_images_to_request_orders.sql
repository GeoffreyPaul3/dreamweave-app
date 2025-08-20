-- Add support for multiple images in request_orders table
ALTER TABLE request_orders 
ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single image_url to image_urls array
UPDATE request_orders 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE image_urls IS NULL;

-- Make image_urls NOT NULL after migration
ALTER TABLE request_orders 
ALTER COLUMN image_urls SET NOT NULL;

-- Add index for image_urls for better query performance
CREATE INDEX IF NOT EXISTS idx_request_orders_image_urls ON request_orders USING GIN (image_urls);

-- Keep image_url column for backward compatibility but mark it as deprecated
-- (We'll remove it in a future migration if needed)
COMMENT ON COLUMN request_orders.image_url IS 'DEPRECATED: Use image_urls JSONB field instead for multiple images support';
