import { render } from '@react-email/components';
import { WelcomeEmail } from './welcome-email';
import { PaymentConfirmedEmail } from './payment-confirmed-email';

/**
 * Render welcome email to HTML
 */
export async function renderWelcomeEmail(data: {
  customerName: string;
  loginUrl?: string;
}) {
  return render(WelcomeEmail(data));
}

/**
 * Render payment confirmed email to HTML
 */
export async function renderPaymentConfirmedEmail(data: {
  customerName: string;
  planName: string;
  amount: number;
  paymentCode: string;
  subscriptionEndDate: string;
  dashboardUrl?: string;
}) {
  return render(PaymentConfirmedEmail(data));
}
