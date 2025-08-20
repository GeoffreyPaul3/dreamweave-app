-- Create request_orders table
CREATE TABLE IF NOT EXISTS request_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  preferred_brand VARCHAR(100),
  budget_range VARCHAR(100),
  delivery_address TEXT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  special_requirements TEXT,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'priced', 'deposit_paid', 'sourcing', 'shipped', 'delivered', 'cancelled')),
  admin_price DECIMAL(10,2),
  admin_notes TEXT,
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  deposit_payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_request_orders_user_id ON request_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_request_orders_status ON request_orders(status);
CREATE INDEX IF NOT EXISTS idx_request_orders_created_at ON request_orders(created_at);

-- Add RLS policies
ALTER TABLE request_orders ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own requests
CREATE POLICY "Users can view their own requests" ON request_orders
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own requests
CREATE POLICY "Users can create requests" ON request_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own requests (for status updates)
CREATE POLICY "Users can update their own requests" ON request_orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to read all requests
CREATE POLICY "Admins can view all requests" ON request_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Allow admins to update all requests
CREATE POLICY "Admins can update all requests" ON request_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_request_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_request_orders_updated_at
  BEFORE UPDATE ON request_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_request_orders_updated_at();
