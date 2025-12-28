import { z } from 'zod';

/**
 * Customer tier enum (same as subscription tier)
 */
export const CustomerTier = {
  FREE: 'free',
  PLUS: 'plus',
  PRO: 'pro',
} as const;

export type CustomerTierType = (typeof CustomerTier)[keyof typeof CustomerTier];

/**
 * Customer status enum
 */
export const CustomerStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
} as const;

export type CustomerStatusType = (typeof CustomerStatus)[keyof typeof CustomerStatus];

/**
 * Registration source enum
 */
export const RegistrationSource = {
  FORM_A: 'form_a',
  FORM_B: 'form_b',
  ADMIN: 'admin',
  IMPORT: 'import',
} as const;

export type RegistrationSourceType =
  (typeof RegistrationSource)[keyof typeof RegistrationSource];

/**
 * Customer database type
 */
export interface Customer {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  facebook_profile: string | null;
  avatar_url: string | null;
  tier: CustomerTierType;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  registration_source: RegistrationSourceType | null;
  customer_notes: string | null;
  tags: string[] | null;
  status: CustomerStatusType;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

/**
 * Create customer schema
 */
export const createCustomerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  facebook_profile: z.string().url().optional().or(z.literal('')),
  registration_source: z
    .enum(['form_a', 'form_b', 'admin', 'import'])
    .default('admin'),
  customer_notes: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

/**
 * Update customer schema
 */
export const updateCustomerSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  facebook_profile: z.string().url().optional().or(z.literal('')),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  customer_notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
