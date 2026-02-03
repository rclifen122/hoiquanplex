-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed_amount')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create promotion_usage table
CREATE TABLE IF NOT EXISTS promotion_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    payment_id UUID REFERENCES payments(id),
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for promotion_usage
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;

-- Update payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id),
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount NUMERIC,
ADD COLUMN IF NOT EXISTS original_amount NUMERIC;

-- RLS Policies for promotions
-- Admins can view/edit all
CREATE POLICY "Admins can do everything on promotions"
ON promotions
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'service_role' 
    OR raw_user_meta_data->>'role' = 'admin' -- Assuming admin role check logic
  )
);

-- Customers can view active promotions (if we want to list them, or just valid check)
-- Usually users only check by code, so explicit select might be restricted.
-- For now, let's allow read for auth users to check validity.
CREATE POLICY "Authenticated users can read active promotions"
ON promotions
FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);


-- RLS Policies for promotion_usage
CREATE POLICY "Admins can view all usage"
ON promotion_usage
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'service_role'
  )
);

CREATE POLICY "Users can view their own usage"
ON promotion_usage
FOR SELECT
USING (auth.uid() IN (
    SELECT auth_user_id FROM customers WHERE id = promotion_usage.customer_id
));
