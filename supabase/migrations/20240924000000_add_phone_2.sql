-- Migration: Add phone_2 to customers table
-- Purpose: Support a second unique phone number per customer

-- 1. Add column
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone_2 TEXT;

-- 2. Add Unique Constraint to phone (ensure primary is unique if not already)
-- Note: Supabase auth.users usually handles email, but we manage public.customers.
-- We want to ensure no two customers share the same primary phone.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_phone_key') THEN
        ALTER TABLE customers ADD CONSTRAINT customers_phone_key UNIQUE (phone);
    END IF;
END $$;

-- 3. Add Unique Constraint to phone_2
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_phone_2_key') THEN
        ALTER TABLE customers ADD CONSTRAINT customers_phone_2_key UNIQUE (phone_2);
    END IF;
END $$;

-- 4. (Optional Strictness) Check Cross-Column Uniqueness?
-- Ideally, we don't want User A's phone_2 to match User B's phone_1.
-- This is harder to enforce with simple constraints and might require a Trigger.
-- For now, we will enforce Column-Level Uniqueness.
