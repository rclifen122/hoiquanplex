import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/payments/[id]/status
 * Get payment status (for polling)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = await createAdminClient();

    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, status, paid_at, verified_at, rejection_reason, expires_at')
      .eq('id', id)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = payment.expires_at ? new Date(payment.expires_at) : null;
    const isExpired = expiresAt && now > expiresAt;

    return NextResponse.json({
      status: payment.status,
      paid_at: payment.paid_at,
      verified_at: payment.verified_at,
      rejection_reason: payment.rejection_reason,
      expires_at: payment.expires_at,
      is_expired: isExpired,
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
