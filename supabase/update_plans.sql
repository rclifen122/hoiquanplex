-- 1. Fix the Check Constraint to allow 'plus' and 'max'
ALTER TABLE subscription_plans
DROP CONSTRAINT IF EXISTS subscription_plans_tier_check;

ALTER TABLE subscription_plans
ADD CONSTRAINT subscription_plans_tier_check 
CHECK (tier IN ('free', 'basic', 'plus', 'pro', 'max'));

-- 2. Deactivate all existing account plans
UPDATE subscription_plans
SET is_active = false
WHERE subscription_type = 'account';

-- 3. Upsert the 3 desired plans
-- 3 Months -> Plus
INSERT INTO subscription_plans (name, slug, tier, subscription_type, duration_months, price, is_active, features)
VALUES 
(
  'Plus 3 Tháng', 
  'plus-3m', 
  'plus', 
  'account', 
  3, 
  180000, 
  true, 
  to_jsonb(ARRAY['Tất cả nội dung Premium', 'Chất lượng 4K HDR', 'Không quảng cáo', 'Xem trên mọi thiết bị'])
)
ON CONFLICT (slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  price = EXCLUDED.price,
  is_active = true,
  features = EXCLUDED.features;

-- 6 Months -> Pro
INSERT INTO subscription_plans (name, slug, tier, subscription_type, duration_months, price, is_active, features)
VALUES 
(
  'Pro 6 Tháng', 
  'pro-6m', 
  'pro', 
  'account', 
  6, 
  330000, 
  true, 
  to_jsonb(ARRAY['Tất cả nội dung Premium', 'Chất lượng 4K HDR', 'Không quảng cáo', 'Xem trên mọi thiết bị', 'Ưu tiên hỗ trợ'])
)
ON CONFLICT (slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  price = EXCLUDED.price,
  is_active = true,
  features = EXCLUDED.features;

-- 12 Months -> Max
INSERT INTO subscription_plans (name, slug, tier, subscription_type, duration_months, price, is_active, features)
VALUES 
(
  'Max 12 Tháng', 
  'max-12m', 
  'max', 
  'account', 
  12, 
  600000, 
  true, 
  to_jsonb(ARRAY['Tất cả nội dung Premium', 'Chất lượng 4K HDR', 'Không quảng cáo', 'Xem trên mọi thiết bị', 'Hỗ trợ VIP 24/7'])
)
ON CONFLICT (slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  price = EXCLUDED.price,
  is_active = true,
  features = EXCLUDED.features;
