import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePaymentCode } from '@/lib/utils/payment-code';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';

export async function POST(req: NextRequest) {
    try {
        const customer = await getCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { planId, planName, amount, interval } = body;

        if (!planId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        // Fetch plan details to get tier and duration
        const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('tier, duration_months, price')
            .eq('id', planId)
            .single();

        if (planError || !planData) {
            console.error('Plan fetch error:', planError);
            return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
        }

        let finalAmount = planData.price;
        let prorationCredit = 0;
        let isUpgrade = false;

        // Fetch active subscription
        const { data: activeSub } = await supabase
            .from('subscriptions')
            .select('*, plan:subscription_plans(price)')
            .eq('customer_id', customer.id)
            .eq('status', 'active')
            .single();

        if (activeSub) {
            if (activeSub.plan_id === planId) {
                return NextResponse.json({ error: 'You are already on this plan' }, { status: 400 });
            }

            const { calculateUpgradeCost } = await import('@/lib/billing/proration');

            const calculation = calculateUpgradeCost(
                {
                    start_date: activeSub.start_date,
                    end_date: activeSub.end_date,
                    plan_price: activeSub.plan.price
                },
                planData.price
            );

            if (calculation.amountToPay < 0) {
                return NextResponse.json({ error: 'Downgrade detected. Please use downgrade option.' }, { status: 400 });
            }

            finalAmount = calculation.amountToPay;
            prorationCredit = calculation.remainingValue;
            isUpgrade = true;
        }

        let discountAmount = 0;
        let promotionId = null;
        // Check local couponCode var from body 
        const { couponCode } = body;

        if (couponCode && typeof couponCode === 'string' && couponCode.trim() !== '') {
            const { validateCoupon } = await import('@/lib/billing/promotions');
            const validation = await validateCoupon(couponCode, finalAmount, customer.id);
            if (!validation.valid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            finalAmount = validation.finalAmount!;
            discountAmount = validation.discountAmount!;
            promotionId = validation.promotion?.id || null;
        }

        const paymentCode = generatePaymentCode();

        // Create pending payment record
        const { data: payment, error: dbError } = await supabase
            .from('payments')
            .insert({
                customer_id: customer.id,
                payment_code: paymentCode,
                amount: finalAmount,
                original_amount: planData.price,
                discount_amount: discountAmount,
                promotion_id: promotionId,
                currency: 'VND',
                status: 'pending',
                payment_method: 'bank_transfer',
                description: isUpgrade
                    ? `Upgrade to ${planName} (Credit: -${prorationCredit})`
                    : `Subscription to ${planName} (${interval})`,
                metadata: {
                    plan_id: planId,
                    plan_name: planName,
                    interval: interval,
                    tier: planData.tier,
                    duration_months: planData.duration_months,
                    coupon_code: couponCode || null,
                    proration_credit: prorationCredit,
                    is_upgrade: isUpgrade,
                    old_subscription_id: activeSub?.id
                }
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to create payment record', details: dbError }, { status: 500 });
        }

        return NextResponse.json({
            paymentId: payment.id,
            paymentCode: paymentCode
        });

    } catch (error) {
        console.error('Manual payment creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
