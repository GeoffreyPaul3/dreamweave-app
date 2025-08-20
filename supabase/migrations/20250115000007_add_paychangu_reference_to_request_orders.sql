-- Add paychangu_reference field to request_orders table
ALTER TABLE request_orders 
ADD COLUMN IF NOT EXISTS paychangu_reference VARCHAR(255);

-- Create index for paychangu_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_request_orders_paychangu_reference ON request_orders(paychangu_reference);

-- Add new status values for payment processing
ALTER TABLE request_orders 
DROP CONSTRAINT IF EXISTS request_orders_status_check;

ALTER TABLE request_orders 
ADD CONSTRAINT request_orders_status_check 
CHECK (status IN ('pending', 'reviewed', 'priced', 'payment_pending', 'deposit_paid', 'final_payment_pending', 'sourcing', 'shipped', 'delivered', 'cancelled'));
