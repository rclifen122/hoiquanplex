import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send-email';
import { render } from '@react-email/components';
import { RenewalReminderEmail } from '@/lib/email/templates/renewal-reminder-email';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/cron/check-expiring-subscriptions
 * Cron job to check for subscriptions expiring in 7 days and send reminders
 * Should be run daily
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createAdminClient();

    // Get current date and date 7 days from now
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find active subscriptions expiring in the next 7 days
    const { data: expiringSubscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        customer:customers(
          id,
          full_name,
          email
        ),
        plan:subscription_plans(
          name,
          price
        )
      `)
      .eq('status', 'active')
      .gte('end_date', now.toISOString())
      .lte('end_date', sevenDaysFromNow.toISOString());

    if (error) {
      console.error('Error fetching expiring subscriptions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expiring subscriptions found',
        count: 0,
      });
    }

    // Send renewal reminder emails
    const emailResults = await Promise.allSettled(
      expiringSubscriptions.map(async (subscription) => {
        const customer = subscription.customer as { id: string; full_name: string; email: string };
        const plan = subscription.plan as { name: string; price: number };

        // Calculate days left
        const endDate = new Date(subscription.end_date);
        const daysLeft = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Render email template
        const emailHtml = await render(
          RenewalReminderEmail({
            customerName: customer.full_name,
            planName: plan.name,
            endDate: subscription.end_date,
            price: plan.price,
            daysLeft,
          })
        );

        // Send email
        return sendEmail({
          to: customer.email,
          subject: `Nhắc nhở gia hạn gói dịch vụ ${plan.name}`,
          html: emailHtml,
          emailType: 'renewal_reminder',
          customerId: customer.id,
          subscriptionId: subscription.id,
          templateName: 'renewal-reminder',
          templateVariables: {
            customerName: customer.full_name,
            planName: plan.name,
            endDate: subscription.end_date,
            price: plan.price,
            daysLeft,
          },
        });
      })
    );

    // Count successes and failures
    const successes = emailResults.filter((r) => r.status === 'fulfilled').length;
    const failures = emailResults.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `Processed ${expiringSubscriptions.length} expiring subscriptions`,
      totalSubscriptions: expiringSubscriptions.length,
      emailsSent: successes,
      emailsFailed: failures,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
