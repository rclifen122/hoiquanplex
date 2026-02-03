import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { z } from 'zod';

const createPromotionSchema = z.object({
    code: z.string().min(3).regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
    description: z.string().optional(),
    discount_type: z.enum(['percent', 'fixed_amount']),
    discount_value: z.number().positive(),
    max_uses: z.number().positive().optional().nullable(),
    expires_at: z.string().datetime().optional().nullable(),
    is_active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
    try {
        const adminUser = await getAdminUser();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validation = createPromotionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid data', details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const supabase = await createAdminClient();
        const { data: promotion, error } = await supabase
            .from('promotions')
            .insert({
                ...validation.data,
                created_by: adminUser.id
            })
            .select()
            .single();

        if (error) {
            // Handle unique constraint violation
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Promotion code already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true, promotion });

    } catch (error) {
        console.error('Create Promotion Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
