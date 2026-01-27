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
        const paymentCode = generatePaymentCode();

        // Create pending payment record
        const { data: payment, error: dbError } = await supabase
            .from('payments')
            .insert({
                customer_id: customer.id,
                payment_code: paymentCode,
                amount: amount,
                currency: 'VND', // Default to VND for VietQR
                status: 'pending',
                payment_method: 'bank_transfer',
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
