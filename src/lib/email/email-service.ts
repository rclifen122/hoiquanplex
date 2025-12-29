
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { render } from '@react-email/components';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@hoiquanplex.site';

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

export type EmailType =
    | 'welcome'
    | 'payment_pending'
    | 'subscription_active'
    | 'subscription_expired'
    | 'payment_failed'
    | 'renewal_reminder';

interface SendEmailParams {
    to: string;
    subject: string;
    template: React.ReactElement;
    type: EmailType;
    userId?: string; // Auth user ID (optional)
    customerId?: string; // Customer ID (optional)
}

export class EmailService {
    /**
     * Send an email and log it to the database
     */
    static async send(params: SendEmailParams) {
        const { to, subject, template, type, userId, customerId } = params;

        try {
            if (!RESEND_API_KEY) {
                console.warn('RESEND_API_KEY is not set. Email sending skipped.');
                return { success: false, error: 'Missing API Key' };
            }

            // 1. Render email template to HTML
            const html = await render(template);

            // 2. Send email via Resend
            const { data, error } = await resend.emails.send({
                from: EMAIL_FROM,
                to,
                subject,
                html,
                tags: [
                    { name: 'type', value: type },
                    { name: 'environment', value: process.env.NODE_ENV || 'development' },
                ],
            });

            if (error) {
                console.error('Error sending email:', error);
                await this.logEmail({
                    userId,
                    customerId,
                    to,
                    subject,
                    type,
                    status: 'failed',
                    providerId: null,
                    error: error.message,
                });
                return { success: false, error };
            }

            // 3. Log success to database
            await this.logEmail({
                userId,
                customerId,
                to,
                subject,
                type,
                status: 'sent',
                providerId: data?.id || null,
            });

            return { success: true, data };

        } catch (err: unknown) {
            console.error('Unexpected error in EmailService:', err);
            // Log critical failure
            await this.logEmail({
                userId,
                customerId,
                to,
                subject,
                type,
                status: 'failed',
                providerId: null,
                error: err instanceof Error ? err.message : 'Unknown error',
            });
            return { success: false, error: err };
        }
    }

    /**
     * Log email attempt to Supabase
     */
    private static async logEmail(logData: {
        userId?: string;
        customerId?: string;
        to: string;
        subject: string;
        type: string;
        status: 'pending' | 'sent' | 'failed';
        providerId: string | null;
        error?: string;
    }) {
        try {
            const supabase = await createClient();

            // Note: We need a service role client to log strictly, 
            // but standard client works if RLS allows insert.
            // Assuming 'email_logs' table exists as per schema.

            await supabase.from('email_logs').insert({
                recipient_email: logData.to,
                subject: logData.subject,
                email_type: logData.type,
                status: logData.status,
                provider_message_id: logData.providerId,
                metadata: logData.error ? { error: logData.error } : null,
                // customer_id linked if available
                customer_id: logData.customerId || null
            });

        } catch (dbError) {
            // Don't throw if logging fails, just warn
            console.warn('Failed to log email to database:', dbError);
        }
    }
}
