import { z } from 'zod';

/**
 * Subscription tier enum
 */
export const SubscriptionTier = {
  FREE: 'free',
  PLUS: 'plus',
  PRO: 'pro',
} as const;

export type SubscriptionTierType = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

/**
 * Subscription status enum
 */
export const SubscriptionStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export type SubscriptionStatusType =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

/**
 * Subscription plan type enum
 */
export const SubscriptionType = {
  ACCOUNT: 'account',
  DEVICE: 'device',
  DEVICE_ADDITIONAL: 'device_additional',
} as const;

export type SubscriptionTypeEnum =
  (typeof SubscriptionType)[keyof typeof SubscriptionType];

/**
 * Subscription plan database type
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  tier: SubscriptionTierType;
  subscription_type: SubscriptionTypeEnum;
  duration_months: number;
  price: number;
  currency: string;
  device_limit: number | null;
  description: string | null;
  features: string[] | null;
  stripe_price_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription database type
 */
export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  tier: SubscriptionTierType;
  device_count: number;
  device_identifiers: Record<string, unknown> | null;
  status: SubscriptionStatusType;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  renewal_reminder_sent: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription with plan and customer details
 */
export interface SubscriptionWithDetails extends Subscription {
  plan: SubscriptionPlan;
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
}

/**
 * Create subscription schema
 */
export const createSubscriptionSchema = z.object({
  customer_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  device_count: z.number().int().positive().default(1),
  start_date: z.string().datetime().optional(),
  auto_renew: z.boolean().default(true),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
