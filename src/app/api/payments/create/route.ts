import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePaymentCode } from '@/lib/utils/payment-code';
import { createPaymentSchema } from '@/types/payment';
import { validateCoupon } from '@/lib/billing/promotions';

/**
 * POST /api/payments/create
 * Create a new payment for a subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { customer_id, plan_id, payment_method, coupon_code } = validationResult.data;

    const supabase = await createClient();

    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, full_name, email')
      .eq('id', customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify plan exists
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found or inactive' },
        { status: 404 }
      );
    }

    let finalAmount = plan.price;
    let discountAmount = 0;
    let promotionId = null;

    if (coupon_code) {
      const validation = await validateCoupon(coupon_code, plan.price, customer_id);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      finalAmount = validation.finalAmount!;
      discountAmount = validation.discountAmount!;
      promotionId = validation.promotion?.id || null;
    }

    // Generate unique payment code (with retry logic)
    let paymentCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      paymentCode = generatePaymentCode();

      // Check if code already exists
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('payment_code', paymentCode)
        .single();

      if (!existingPayment) {
        isUnique = true;
        break;
      }

      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique payment code. Please try again.' },
        { status: 500 }
      );
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        customer_id,
        amount: finalAmount,
        original_amount: plan.price,
        discount_amount: discountAmount,
        promotion_id: promotionId,
        currency: 'VND',
        status: 'pending',
        payment_method,
        payment_code: paymentCode!,
        expires_at: expiresAt.toISOString(),
        metadata: {
          plan_id,
          plan_name: plan.name,
          plan_slug: plan.slug,
          tier: plan.tier,
          duration_months: plan.duration_months,
          coupon_code: coupon_code || null,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: payment.id,
          payment_code: payment.payment_code,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          expires_at: payment.expires_at,
          customer: {
            name: customer.full_name,
            email: customer.email,
          },
          plan: {
            name: plan.name,
            tier: plan.tier,
            duration_months: plan.duration_months,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
