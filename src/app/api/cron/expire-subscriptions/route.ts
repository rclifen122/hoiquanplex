import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/cron/expire-subscriptions
 * Cron job to automatically expire subscriptions that have passed their end date
 * Should be run daily
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get current date
    const now = new Date().toISOString();

    // Find all active subscriptions that have passed their end date
    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        customer:customers(id, tier)
      `)
      .eq('status', 'active')
      .lt('end_date', now);

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions to expire',
        count: 0,
      });
    }

    // Update subscriptions to expired status
    const subscriptionIds = expiredSubscriptions.map((s) => s.id);

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .in('id', subscriptionIds);

    if (updateError) {
      console.error('Error updating subscriptions:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // For each customer, check if they have any other active subscriptions
    // If not, revert them to free tier
    const customerUpdates = await Promise.allSettled(
      expiredSubscriptions.map(async (subscription) => {
        const customer = subscription.customer as { id: string; tier: string };

        // Check if customer has any other active subscriptions
        const { data: otherActiveSubscriptions } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('customer_id', customer.id)
          .in('status', ['active', 'past_due']);

        // If no other active subscriptions, revert to free tier
        if (!otherActiveSubscriptions || otherActiveSubscriptions.length === 0) {
          return supabase
            .from('customers')
            .update({
              tier: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', customer.id);
        }

        return null;
      })
    );

    const customersReverted = customerUpdates.filter(
      (r) => r.status === 'fulfilled' && r.value !== null
    ).length;

    return NextResponse.json({
      success: true,
      message: `Expired ${expiredSubscriptions.length} subscriptions`,
      subscriptionsExpired: expiredSubscriptions.length,
      customersRevertedToFree: customersReverted,
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
