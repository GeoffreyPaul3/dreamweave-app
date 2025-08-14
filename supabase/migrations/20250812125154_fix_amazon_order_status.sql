-- Fix amazon_orders status constraint to include payment_pending
ALTER TABLE amazon_orders DROP CONSTRAINT IF EXISTS amazon_orders_status_check;
ALTER TABLE amazon_orders ADD CONSTRAINT amazon_orders_status_check 
CHECK (status IN ('pending', 'payment_pending', 'processing', 'shipped', 'delivered', 'successful', 'cancelled'));
