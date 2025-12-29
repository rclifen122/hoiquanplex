
import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { z } from 'zod';
import { generatePaymentCode } from '@/lib/utils/payment-code';
import { formatCurrency } from '@/lib/utils/format';

const upgradeSchema = z.object({
    plan_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Authentication
        const customer = await getCustomer();
        if (!customer) {
            return NextResponse.json(
                { error: 'Unauthorized', redirect: '/customer/login' },
                { status: 401 }
            );
        }

        // 2. Validate Request
        const body = await request.json();
        const validationResult = upgradeSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const { plan_id } = validationResult.data;
        const supabase = createAdminClient();

        // 3. Get Plan Details
        const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', plan_id)
            .single();

        if (planError || !plan) {
            return NextResponse.json(
                { error: 'Gói dịch vụ không tồn tại' },
                { status: 404 }
            );
        }

        // 4. Check for Existing Active Subscription to same plan
        const { data: currentSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('customer_id', customer.id)
            .eq('status', 'active')
            .eq('plan_id', plan_id)
            .single();

        if (currentSubscription) {
            return NextResponse.json(
                { error: 'Bạn đang sử dụng gói dịch vụ này' },
                { status: 400 }
            );
        }

        // 5. Generate Payment Code
        let paymentCode = generatePaymentCode();
        let attempts = 0;
        while (attempts < 5) {
            const { data: existing } = await supabase
                .from('payments')
                .select('id')
                .eq('payment_code', paymentCode)
                .single();
            if (!existing) break;
            paymentCode = generatePaymentCode();
            attempts++;
        }

        // 6. Create Payment Record
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                customer_id: customer.id,
                amount: plan.price,
                currency: 'VND',
                status: 'pending',
                payment_method: 'bank_transfer',
                payment_code: paymentCode,
                expires_at: expiresAt.toISOString(),
                metadata: {
                    plan_id: plan.id,
                    plan_name: plan.name,
                    plan_slug: plan.slug,
                    tier: plan.tier,
                    duration_months: plan.duration_months,
                    type: 'upgrade',
                },
            })
            .select()
            .single();

        if (paymentError) {
            // eslint-disable-next-line no-console
            console.error('Payment creation error:', paymentError);
            return NextResponse.json(
                { error: 'Không thể tạo thanh toán' },
                { status: 500 }
            );
        }

        // 7. Send Payment Pending Email
        try {
            const { render } = await import('@react-email/components');
            const { PaymentPendingEmail } = await import('@/lib/email/templates/payment-pending-email');
            const { sendEmail } = await import('@/lib/email/send-email');

            const emailHtml = await render(
                PaymentPendingEmail({
                    customerName: customer.full_name,
                    paymentCode: paymentCode,
                    amount: formatCurrency(plan.price),
                    planName: plan.name,
                })
            );

            await sendEmail({
                to: customer.email,
                subject: `Xác nhận nâng cấp ${plan.name} - Mã thanh toán ${paymentCode}`,
                html: emailHtml,
                emailType: 'payment_pending',
                customerId: customer.id,
                templateName: 'payment-pending',
            });
        } catch (emailError) {
            // eslint-disable-next-line no-console
            console.error('Failed to email:', emailError);
        }

        return NextResponse.json({
            success: true,
            payment_code: paymentCode,
            amount: plan.price,
            bank_info: {
                bank_name: process.env.BANK_NAME || 'Techcombank',
                account_number: process.env.BANK_ACCOUNT_NUMBER || '19036089308012',
                account_name: process.env.BANK_ACCOUNT_NAME || 'NGUYEN TUAN ANH',
            }
        });

    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Upgrade error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
