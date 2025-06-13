-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Create has_role function
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
        AND role = _role
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION has_role TO authenticated;
GRANT EXECUTE ON FUNCTION has_role TO service_role;

-- Insert admin role for your email
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'geofreypaul40@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update your profile to have verified KYC status
UPDATE profiles
SET kyc_status = 'verified',
    is_seller = true
WHERE id IN (
    SELECT id
    FROM auth.users
    WHERE email = 'geofreypaul40@gmail.com'
); 