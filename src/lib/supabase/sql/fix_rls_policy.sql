-- FIX RLS POLICIES for Payments Table
-- The previous policy assumed customer_id = auth.uid(), which is incorrect.
-- customer_id is the primary key of the customers table, while auth.uid() is the auth.users id.

-- 1. Drop the incorrect policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."payments";
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON "public"."payments";

-- 2. Create Correct INSERT Policy
-- Allow insert if the customer_id belongs to the currently authenticated user
CREATE POLICY "Enable insert for authenticated users via customers table" ON "public"."payments"
FOR INSERT 
TO authenticated 
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
  )
);

-- 3. Create Correct SELECT Policy
-- Allow select if the customer_id belongs to the currently authenticated user
CREATE POLICY "Enable select for users via customers table" ON "public"."payments"
FOR SELECT 
TO authenticated 
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
  )
);
