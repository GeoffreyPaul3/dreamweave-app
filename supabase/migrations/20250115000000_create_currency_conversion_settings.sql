-- Create currency conversion settings table
CREATE TABLE IF NOT EXISTS currency_conversion_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  conversion_rate DECIMAL(10,4) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active settings
CREATE INDEX IF NOT EXISTS idx_currency_conversion_active 
ON currency_conversion_settings(is_active, from_currency, to_currency);

-- Insert default conversion rate (1 AED = 1000 MWK)
INSERT INTO currency_conversion_settings (from_currency, to_currency, conversion_rate, is_active)
VALUES ('AED', 'MWK', 1000.0000, true)
ON CONFLICT DO NOTHING;

-- Add RLS policies
ALTER TABLE currency_conversion_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to currency conversion settings" ON currency_conversion_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update/delete access to authenticated users (admin functionality)
CREATE POLICY "Allow full access to currency conversion settings" ON currency_conversion_settings
  FOR ALL USING (auth.role() = 'authenticated');
