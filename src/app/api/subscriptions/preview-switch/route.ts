import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { calculateUpgradeCost } from '@/lib/billing/proration';

export async function POST(req: NextRequest) {
    try {
        const customer = await getCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { newPlanId } = body;

        const supabase = await createClient();

        // 1. Get Active Subscription
        const { data: activeSub } = await supabase
            .from('subscriptions')
            .select('*, plan:subscription_plans(price, name)')
            .eq('customer_id', customer.id)
            .eq('status', 'active')
            .single();

        // 2. Get New Plan
        const { data: newPlan } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', newPlanId)
            .single();

        if (!newPlan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // If no active subscription, simple purchase (full price)
        if (!activeSub) {
            return NextResponse.json({
                amountToPay: newPlan.price,
                remainingValue: 0,
                upgradeCost: newPlan.price,
                isUpgrade: true,
                hasActiveSubscription: false
            });
        }

        // 3. Calculate Proration
        const calculation = calculateUpgradeCost(
            {
                start_date: activeSub.start_date,
                end_date: activeSub.end_date,
                plan_price: activeSub.plan.price
            },
            newPlan.price
        );

        return NextResponse.json({
            ...calculation,
            hasActiveSubscription: true,
            currentPlanName: activeSub.plan.name
        });

    } catch (error) {
        console.error('Preview Switch Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
