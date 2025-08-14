-- Fix foreign key constraint on amazon_orders table
-- Change from CASCADE to SET NULL so orders are preserved when products are deleted

-- First, drop the existing foreign key constraint
ALTER TABLE amazon_orders 
DROP CONSTRAINT IF EXISTS amazon_orders_product_id_fkey;

-- Add the new foreign key constraint with SET NULL
ALTER TABLE amazon_orders 
ADD CONSTRAINT amazon_orders_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES amazon_products(id) 
ON DELETE SET NULL;

-- Add a comment to explain the change
COMMENT ON CONSTRAINT amazon_orders_product_id_fkey ON amazon_orders IS 'Orders are preserved when products are deleted, product_id is set to NULL';
