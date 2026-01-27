import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const { customerId, paymentId, planId, planName } = session.metadata || {};

                if (!customerId || !paymentId) {
                    console.error('Missing metadata in Stripe session');
                    break;
                }

                console.log(`Processing successful checkout for customer ${customerId}`);

                // 1. Update Payment Status
                await supabase
                    .from('payments')
                    .update({
                        status: 'succeeded',
                        stripe_session_id: session.id,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', paymentId);

                // 2. Upsert Subscription
                // Calculate dates
                const now = new Date();
                const endDate = new Date();
                // Default to 30 days if subscription details missing, but usually Stripe sends expected expiration or we infer from plan
                // Ideally we fetch subscription details from Stripe if session.subscription is present
                if (session.subscription) {
                    const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
                    endDate.setTime(stripeSub.current_period_end * 1000);
                } else {
                    // Fallback default 1 month
                    endDate.setMonth(endDate.getMonth() + 1);
                }

                // Check if subscription exists
                const { data: existingSub } = await supabase
                    .from('subscriptions')
                    .select('id')
                    .eq('customer_id', customerId)
                    .single();

                if (existingSub) {
                    await supabase
                        .from('subscriptions')
                        .update({
                            status: 'active',
                            plan_id: planId,
                            current_period_start: now.toISOString(),
                            current_period_end: endDate.toISOString(),
                            updated_at: now.toISOString(),
                        })
                        .eq('id', existingSub.id);
                } else {
                    await supabase
                        .from('subscriptions')
                        .insert({
                            customer_id: customerId,
                            plan_id: planId,
                            status: 'active',
                            current_period_start: now.toISOString(),
                            current_period_end: endDate.toISOString(),
                        });
                }

                // 3. Update Customer Tier
                // Map planName to tier
                let newTier = 'free';
                const nameLower = (planName || '').toLowerCase();
                if (nameLower.includes('pro')) newTier = 'pro';
                else if (nameLower.includes('basic')) newTier = 'basic';

                if (newTier !== 'free') {
                    await supabase
                        .from('customers')
                        .update({
                            tier: newTier,
                            status: 'active'
                        })
                        .eq('id', customerId);
                }

                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
