import { resend, emailConfig, type EmailTypeEnum } from './resend';
import { createClient } from '@/lib/supabase/server';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  emailType: EmailTypeEnum;
  customerId?: string;
  subscriptionId?: string;
  templateName?: string;
  templateVariables?: Record<string, unknown>;
}

/**
 * Send email via Resend and log to database
 */
export async function sendEmail(options: SendEmailOptions) {
  const {
    to,
    subject,
    html,
    emailType,
    customerId,
    subscriptionId,
    templateName,
    templateVariables,
  } = options;

  try {
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to,
      subject,
      html,
      reply_to: emailConfig.replyTo,
    });

    if (error) {
      console.error('Resend error:', error);

      // Log failed email to database
      await logEmail({
        recipientEmail: to,
        subject,
        emailType,
        customerId,
        subscriptionId,
        templateName,
        templateVariables,
        status: 'failed',
        errorMessage: error.message,
      });

      throw new Error(error.message);
    }

    // Log successful email to database
    await logEmail({
      recipientEmail: to,
      subject,
      emailType,
      customerId,
      subscriptionId,
      templateName,
      templateVariables,
      status: 'sent',
      providerMessageId: data?.id,
    });

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending error:', error);

    // Log failed email
    await logEmail({
      recipientEmail: to,
      subject,
      emailType,
      customerId,
      subscriptionId,
      templateName,
      templateVariables,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Log email to database
 */
async function logEmail(data: {
  recipientEmail: string;
  subject: string;
  emailType: EmailTypeEnum;
  customerId?: string;
  subscriptionId?: string;
  templateName?: string;
  templateVariables?: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed';
  providerMessageId?: string;
  errorMessage?: string;
}) {
  try {
    const supabase = await createClient();

    await supabase.from('email_logs').insert({
      customer_id: data.customerId || null,
      subscription_id: data.subscriptionId || null,
      email_type: data.emailType,
      recipient_email: data.recipientEmail,
      subject: data.subject,
      template_name: data.templateName || null,
      template_variables: data.templateVariables || null,
      status: data.status,
      email_provider: 'resend',
      provider_message_id: data.providerMessageId || null,
      error_message: data.errorMessage || null,
      sent_at: data.status === 'sent' ? new Date().toISOString() : null,
    });
  } catch (error) {
    console.error('Failed to log email:', error);
    // Don't throw - logging failure shouldn't break email sending
  }
}
