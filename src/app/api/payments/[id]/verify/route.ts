import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth/auth-helpers';

/**
 * POST /api/payments/[id]/verify
 * Verify and approve a payment (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bank_transaction_ref, action } = body;

    const supabase = await createClient();

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, customer:customers(*)')
      .eq('id', params.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve payment
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          bank_transaction_ref,
          verified_by: adminUser.id,
          verified_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update payment' },
          { status: 500 }
        );
      }

      // Create subscription if metadata includes plan info
      if (payment.metadata && payment.metadata.plan_id) {
        const planId = payment.metadata.plan_id as string;
        const durationMonths = payment.metadata.duration_months as number;
        const tier = payment.metadata.tier as string;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);

        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            customer_id: payment.customer_id,
            plan_id: planId,
            tier,
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            auto_renew: true,
          });

        if (subError) {
          console.error('Failed to create subscription:', subError);
        } else {
          // Update customer tier
          await supabase
            .from('customers')
            .update({ tier })
            .eq('id', payment.customer_id);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified and subscription created',
      });
    } else if (action === 'reject') {
      // Reject payment
      const { rejection_reason } = body;

      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'cancelled',
          rejection_reason,
          verified_by: adminUser.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update payment' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
