import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const formSubmissionSchema = z.object({
  form_type: z.enum(['form_a', 'form_b']),
  form_data: z.object({
    full_name: z.string().min(2),
    email: z.string().email(),
    phone: z.string(),
    facebook_profile: z.string().optional(),
    plan_id: z.string().uuid(),
  }),
  utm_source: z.string().optional().nullable(),
  utm_medium: z.string().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
});

/**
 * POST /api/forms/submit
 * Submit a registration form and create customer + payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = formSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { form_type, form_data, utm_source, utm_medium, utm_campaign } = validationResult.data;

    const supabase = createAdminClient();

    // Check if email already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, email')
      .eq('email', form_data.email)
      .single();

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email đã được đăng ký. Vui lòng sử dụng email khác.' },
        { status: 400 }
      );
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', form_data.plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Gói dịch vụ không tồn tại' },
        { status: 404 }
      );
    }

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: form_data.full_name,
        email: form_data.email,
        phone: form_data.phone,
        facebook_profile: form_data.facebook_profile || null,
        tier: 'free', // Start as free, will be upgraded after payment
        registration_source: form_type,
        status: 'active',
      })
      .select()
      .single();

    if (customerError) {
      console.error('Customer creation error:', customerError);
      return NextResponse.json(
        { error: 'Không thể tạo tài khoản khách hàng' },
        { status: 500 }
      );
    }

    // Create form submission record
    const { error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_type,
        form_data: form_data as unknown as Record<string, unknown>,
        email: form_data.email,
        full_name: form_data.full_name,
        phone: form_data.phone,
        selected_plan_id: form_data.plan_id,
        customer_id: customer.id,
        utm_source,
        utm_medium,
        utm_campaign,
        referrer: request.headers.get('referer'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        status: 'converted', // Already converted to customer
      });

    if (submissionError) {
      console.error('Form submission error:', submissionError);
    }

    // Create payment
    const { generatePaymentCode } = await import('@/lib/utils/payment-code');
    let paymentCode = generatePaymentCode();

    // Ensure unique payment code
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

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: payment, error: paymentError } = await supabase
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
          from_form: form_type,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json(
        { error: 'Không thể tạo thanh toán' },
        { status: 500 }
      );
    }

    // Send Payment Pending Email
    try {
      const { render } = await import('@react-email/components');
      const { PaymentPendingEmail } = await import('@/lib/email/templates/payment-pending-email');
      const { sendEmail } = await import('@/lib/email/send-email');
      const { formatCurrency } = await import('@/lib/utils/format');

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
        subject: `Xác nhận đăng ký ${plan.name} - Mã thanh toán ${paymentCode}`,
        html: emailHtml,
        emailType: 'payment_pending',
        customerId: customer.id,
        templateName: 'payment-pending',
      });
    } catch (emailError) {
      console.error('Failed to send payment pending email:', emailError);
      // Don't fail the request, just log error
    }

    return NextResponse.json({
      success: true,
      customer_id: customer.id,
      payment_id: payment.id,
      payment_code: paymentCode,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
