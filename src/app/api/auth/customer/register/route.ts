import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const registerSchema = z.object({
    full_name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    facebook_profile: z.string().optional(),
});

/**
 * POST /api/auth/customer/register
 * Register a new customer account with email and password
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request
        const validationResult = registerSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Dữ liệu không hợp lệ', details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const { full_name, email, password, phone, facebook_profile } = validationResult.data;

        const supabase = createAdminClient();

        // Check if email already exists
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('email', email)
            .single();

        if (existingCustomer) {
            return NextResponse.json(
                { error: 'Email đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.' },
                { status: 400 }
            );
        }

        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                role: 'customer',
            },
        });

        if (authError) {
            // eslint-disable-next-line no-console
            console.error('Auth user creation error:', authError);
            return NextResponse.json(
                { error: 'Không thể tạo tài khoản. ' + (authError.message || '') },
                { status: 500 }
            );
        }

        // Create customer record
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .insert({
                auth_user_id: authUser.user.id,
                full_name,
                email,
                phone: phone || null,
                facebook_profile: facebook_profile || null,
                tier: 'free', // Default to free tier
                registration_source: 'form_a',
                status: 'active',
            })
            .select()
            .single();

        if (customerError) {
            // eslint-disable-next-line no-console
            console.error('Customer creation error:', customerError);
            // eslint-disable-next-line no-console
            console.error('Customer creation error details:', JSON.stringify(customerError, null, 2));
            // Clean up auth user if customer creation fails
            await supabase.auth.admin.deleteUser(authUser.user.id);
            return NextResponse.json(
                {
                    error: 'Không thể tạo tài khoản khách hàng',
                    details: customerError.message,
                    hint: customerError.hint,
                },
                { status: 500 }
            );
        }

        // Send welcome email (optional)
        try {
            const { render } = await import('@react-email/components');
            const { WelcomeEmail } = await import('@/lib/email/templates/welcome-email');
            const { sendEmail } = await import('@/lib/email/send-email');

            const emailHtml = await render(
                WelcomeEmail({
                    customerName: full_name,
                    loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/customer/login`,
                })
            );

            await sendEmail({
                to: email,
                subject: 'Chào mừng đến với HoiQuanPlex!',
                html: emailHtml,
                emailType: 'welcome',
                customerId: customer.id,
                templateName: 'welcome',
            });
        } catch (emailError) {
            // eslint-disable-next-line no-console
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng đăng nhập.',
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
            { status: 500 }
        );
    }
}
