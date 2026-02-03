import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { z } from 'zod';

const cancelSchema = z.object({
    action: z.enum(['immediate', 'end_of_period']),
    refund_amount: z.number().optional().default(0),
    reason: z.string().optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const adminUser = await getAdminUser();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validation = cancelSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid request', details: validation.error }, { status: 400 });
        }

        const { action, refund_amount } = validation.data;
        const supabase = await createAdminClient();

        if (action === 'immediate') {
            // Cancel immediately
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    status: 'cancelled',
                    end_date: new Date().toISOString(),
                    auto_renew: false,
                    // metadata: { cancelled_by: adminUser.id, reason, refund_amount } // If metadata exists
                })
                .eq('id', params.id);

            if (error) throw error;

            // TODO: Process Refund Record if refund_amount > 0
            // We might want to insert into a 'refunds' table or 'transactions' table.
            // For now, we'll just log it to console or assume the update is enough.
            console.log(`Admin ${adminUser.id} cancelled subscription ${params.id}. Refund: ${refund_amount}`);

        } else {
            // Cancel at end of period (Turn off auto-renew)
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    auto_renew: false,
                    // metadata: { cancel_at_period_end_set_by: adminUser.id, reason }
                })
                .eq('id', params.id);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Cancel Subscription Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
