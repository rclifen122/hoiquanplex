import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@hoiquanplex.site',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@hoiquanplex.site',
};

/**
 * Email types for tracking
 */
export const EmailType = {
  WELCOME: 'welcome',
  SUBSCRIPTION_CONFIRMATION: 'subscription_confirmation',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  RENEWAL_REMINDER: 'renewal_reminder',
  RENEWAL_SUCCESS: 'renewal_success',
  PAYMENT_FAILED: 'payment_failed',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  CUSTOM: 'custom',
  ADMIN_NOTIFICATION: 'admin_notification',
} as const;

export type EmailTypeEnum = (typeof EmailType)[keyof typeof EmailType];
