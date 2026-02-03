import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { calculateUpgradeCost } from '@/lib/billing/proration';
import { sendEmail } from '@/lib/email/send-email';
import { adminRefundAlertTemplate } from '@/lib/email/templates/admin-refund-alert';
import { EmailType } from '@/lib/email/resend';

export async function POST(req: NextRequest) {
    try {
        const customer = await getCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { newPlanId } = body;

        const supabase = await createClient();

        // 1. Get data (similar to preview)
        const { data: activeSub } = await supabase
            .from('subscriptions')
            .select('*, plan:subscription_plans(price, name)')
            .eq('customer_id', customer.id)
            .eq('status', 'active')
            .single();

        const { data: newPlan } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', newPlanId)
            .single();

        if (!activeSub || !newPlan) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // 2. Validate it IS a downgrade (negative amountToPay)
        const calculation = calculateUpgradeCost(
            {
                start_date: activeSub.start_date,
                end_date: activeSub.end_date,
                plan_price: activeSub.plan.price
            },
            newPlan.price
        );

        if (calculation.amountToPay >= 0) {
            return NextResponse.json({ error: 'This is not a downgrade that requires refund' }, { status: 400 });
        }

        const refundAmount = Math.abs(calculation.amountToPay);

        // 3. Create a "Downgrade Request" (Using payments table or specific table? 
        // User requested "send to admin page". 
        // We can create a 'payment' record with status 'refund_pending' or similar, 
        // OR just rely on email + manually checking.
        // Let's create a payment record with negative amount? Or specific type.
        // System Prompt Rule: "Downgrade: NO automatic refund... System calculates... checks... Actionable Alert".

        // We'll create a payment record to track this request in Admin.
        // Status: 'refund_pending' (Need to add this to enum if not exists, or usage 'pending' with type 'refund')
        // Let's use 'pending' and metadata to indicate Refund Request.

        const { error: insertError } = await supabase
            .from('payments')
            .insert({
                customer_id: customer.id,
                amount: refundAmount, // Positive value for display
                currency: 'VND',
                status: 'pending', // Pending Admin Action
                payment_method: 'bank_transfer', // Default
                description: `Refund Request: Downgrade from ${activeSub.plan.name} to ${newPlan.name}`,
                metadata: {
                    type: 'downgrade_refund',
                    old_plan_id: activeSub.plan_id,
                    new_plan_id: newPlan.id,
                    old_subscription_id: activeSub.id,
                    refund_amount: refundAmount
                }
            });

        if (insertError) throw insertError;

        // 4. Send Email to Admin
        console.log(`Downgrade Request: User ${customer.email} wants refund ${refundAmount}`);

        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'support@hoiquanplex.site',
                subject: `[ACTION REQUIRED] Yêu cầu hoàn tiền - ${customer.email}`,
                html: adminRefundAlertTemplate({
                    customerName: customer.full_name || 'N/A',
                    customerEmail: customer.email,
                    oldPlanName: activeSub.plan.name,
                    newPlanName: newPlan.name,
                    refundAmount: refundAmount,
                    reason: 'Downgrade Request'
                }),
                emailType: EmailType.ADMIN_NOTIFICATION,
            });
        } catch (emailError) {
            console.error('Failed to send admin email:', emailError);
        }

        return NextResponse.json({ success: true, refundAmount });

    } catch (error) {
        console.error('Downgrade Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
