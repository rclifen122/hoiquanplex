import { z } from 'zod';

/**
 * Payment status enum
 */
export const PaymentStatus = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * Payment method enum
 */
export const PaymentMethod = {
  BANK_TRANSFER: 'bank_transfer',
  VNPAY: 'vnpay',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

/**
 * Payment database type
 */
export interface Payment {
  id: string;
  customer_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  payment_method: PaymentMethodType | null;

  // Manual bank transfer fields
  payment_code: string | null;
  bank_transaction_ref: string | null;
  payment_screenshot_url: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;

  // Gateway fields
  gateway_transaction_id: string | null;
  gateway_response: Record<string, unknown> | null;

  // Failure handling
  failure_reason: string | null;
  retry_count: number;
  next_retry_date: string | null;

  // Invoice
  invoice_url: string | null;
  receipt_url: string | null;

  // Metadata
  metadata: Record<string, unknown> | null;

  // Timestamps
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
}

/**
 * Payment with customer and plan details (for display)
 */
export interface PaymentWithDetails extends Payment {
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
  subscription?: {
    id: string;
    tier: string;
    plan_name: string;
  };
}

/**
 * Create payment request schema
 */
export const createPaymentSchema = z.object({
  customer_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(['bank_transfer', 'vnpay', 'momo', 'zalopay']),
  coupon_code: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

/**
 * Verify payment schema (admin action)
 */
export const verifyPaymentSchema = z.object({
  payment_id: z.string().uuid(),
  bank_transaction_ref: z.string().min(1, 'Bank transaction reference is required'),
  verified_by: z.string().uuid(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

/**
 * Reject payment schema (admin action)
 */
export const rejectPaymentSchema = z.object({
  payment_id: z.string().uuid(),
  rejection_reason: z.string().min(1, 'Rejection reason is required'),
  verified_by: z.string().uuid(),
});

export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
