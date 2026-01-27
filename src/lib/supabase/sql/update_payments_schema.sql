-- Run this in your Supabase SQL Editor to update the payments table

-- 1. Add payment_code for manual tracking
ALTER TABLE "public"."payments" 
ADD COLUMN IF NOT EXISTS "payment_code" text;

-- 2. Add payment_method to distinguish Stripe vs Manual
ALTER TABLE "public"."payments" 
ADD COLUMN IF NOT EXISTS "payment_method" text DEFAULT 'stripe';

-- 3. Add metadata for flexible data storage
ALTER TABLE "public"."payments" 
ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;

-- 4. Add description for payment context
ALTER TABLE "public"."payments" 
ADD COLUMN IF NOT EXISTS "description" text;

-- 5. Enable Row Level Security (RLS) if not enabled
ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;

-- 6. Allow Authenticated Users to Insert Payments (Required for Checkout)
CREATE POLICY "Enable insert for authenticated users only" ON "public"."payments"
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = customer_id);

-- 7. Allow Users to View their Own Payments
CREATE POLICY "Enable select for users based on user_id" ON "public"."payments"
FOR SELECT 
TO authenticated 
USING (auth.uid() = customer_id);
