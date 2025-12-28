import { sendEmail } from './send-email';
import { EmailType } from './resend';
import { renderWelcomeEmail, renderPaymentConfirmedEmail } from './templates/render';

/**
 * Send welcome email to new customer
 */
export async function sendWelcomeEmail(data: {
  to: string;
  customerName: string;
  customerId: string;
  loginUrl?: string;
}) {
  const html = await renderWelcomeEmail({
    customerName: data.customerName,
    loginUrl: data.loginUrl,
  });

  return sendEmail({
    to: data.to,
    subject: `Chào mừng ${data.customerName} đến với HoiQuanPlex!`,
    html,
    emailType: EmailType.WELCOME,
    customerId: data.customerId,
    templateName: 'welcome-email',
    templateVariables: {
      customerName: data.customerName,
      loginUrl: data.loginUrl,
    },
  });
}

/**
 * Send payment confirmed email
 */
export async function sendPaymentConfirmedEmail(data: {
  to: string;
  customerName: string;
  customerId: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  paymentCode: string;
  subscriptionEndDate: string;
  dashboardUrl?: string;
}) {
  const html = await renderPaymentConfirmedEmail({
    customerName: data.customerName,
    planName: data.planName,
    amount: data.amount,
    paymentCode: data.paymentCode,
    subscriptionEndDate: data.subscriptionEndDate,
    dashboardUrl: data.dashboardUrl,
  });

  return sendEmail({
    to: data.to,
    subject: `✅ Thanh toán ${data.paymentCode} đã được xác nhận`,
    html,
    emailType: EmailType.PAYMENT_CONFIRMED,
    customerId: data.customerId,
    subscriptionId: data.subscriptionId,
    templateName: 'payment-confirmed-email',
    templateVariables: {
      customerName: data.customerName,
      planName: data.planName,
      amount: data.amount,
      paymentCode: data.paymentCode,
      subscriptionEndDate: data.subscriptionEndDate,
      dashboardUrl: data.dashboardUrl,
    },
  });
}
