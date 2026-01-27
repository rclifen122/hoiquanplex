-- Add columns for payment verification tracking
ALTER TABLE "public"."payments" 
ADD COLUMN IF NOT EXISTS "bank_transaction_ref" text,
ADD COLUMN IF NOT EXISTS "verified_by" uuid,
ADD COLUMN IF NOT EXISTS "verified_at" timestamptz,
ADD COLUMN IF NOT EXISTS "paid_at" timestamptz,
ADD COLUMN IF NOT EXISTS "rejection_reason" text;

-- Optional: Add foreign key constraint for verified_by if you want to link it to auth.users or admin_users
-- ALTER TABLE "public"."payments" 
-- ADD CONSTRAINT "payments_verified_by_fkey" 
-- FOREIGN KEY ("verified_by") REFERENCES "auth"."users" ("id");
