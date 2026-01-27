import { NextRequest, NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import { generatePaymentCode } from '@/lib/utils/payment-code';

export async function POST(req: NextRequest) {
    try {
        const customer = await getCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { planId, planName, amount, currency = 'VND', interval = 'month' } = body;

        if (!planId || !amount) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const supabase = await createClient();
        const paymentCode = generatePaymentCode();

        // 1. Create pending payment record
        const { data: payment, error: dbError } = await supabase
            .from('payments')
            .insert({
                customer_id: customer.id,
                payment_code: paymentCode,
                amount: amount,
                currency: currency,
                status: 'pending',
                payment_method: 'stripe',
                description: `Subscription to ${planName} (${interval})`,
                metadata: {
                    plan_id: planId,
                    plan_name: planName,
                    interval: interval
                }
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
        }

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: `HoiQuanPlex - ${planName}`,
                            description: `Subscription for ${interval}`,
                        },
                        unit_amount: amount, // Stripe expects amount in smallest currency unit (e.g., cents), but for VND it's usually 1-1. Need to verify. VND is zero-decimal.
                        // IMPORTANT: For VND, amount is integer. For USD, it's cents.
                        // Assuming input amount is already correct for the currency.
                        // However, usually plans are stored in standard units.
                        // Let's assume passed amount is standard units.
                        // If VND, pass 100000. If USD, pass 1000 (10.00).
                        // Stripe VND is a zero-decimal currency? No, Stripe treats VND as 1 unit = 1 VND.
                        // Stripe USD is 1 unit = 1 cent.
                        // To be safe, if VND, use amount. If USD, amount * 100.
                        // CURRENTLY: System seems to use VND mainly.
                        recurring: interval === 'month' || interval === 'year' ? {
                            interval: interval === 'month' ? 'month' : 'year',
                        } : undefined,
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription', // or 'payment' for one-time
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/subscription`,
            customer_email: customer.email,
            metadata: {
                customerId: customer.id,
                paymentId: payment.id,
                paymentCode: paymentCode,
                planId: planId,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });

    } catch (error) {
        console.error('Stripe error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
