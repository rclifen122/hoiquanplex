import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { sendEmail } from '@/lib/email/send-email';
import { render } from '@react-email/components';
import { PaymentConfirmedEmail } from '@/lib/email/templates/payment-confirmed-email';
import { customAlphabet } from 'nanoid';

// Generate a readable password
const generatePassword = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz', 10);

/**
 * POST /api/payments/[id]/verify
 * Verify and approve a payment (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bank_transaction_ref, action } = body;

    const supabase = await createAdminClient();

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, customer:customers(*)')
      .eq('id', params.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // 1. Create User Account if not exists
      let authUserId = payment.customer.auth_user_id;
      let generatedCredentials = null;

      if (!authUserId) {
        // Create new Auth User
        const password = generatePassword();
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: payment.customer.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: payment.customer.full_name,
            role: 'customer',
          },
        });

        if (authError) {
          console.error('Failed to create auth user:', authError);
          // If user already exists in Auth but not linked in customers table
          if (authError.message.includes('already been registered')) {
            // Try to find the user to link
            // Since we can't search users by email easily with public API, 
            // we assume this might be an edge case. 
            // For now, fail safely or continue without credentials.
            console.warn('User likely already exists, proceeding without password generation');
          } else {
            return NextResponse.json(
              { error: 'Failed to create user account: ' + authError.message },
              { status: 500 }
            );
          }
        } else {
          authUserId = authUser.user.id;
          generatedCredentials = {
            email: payment.customer.email,
            password: password,
          };

          // Link customer to auth user
          await supabase
            .from('customers')
            .update({ auth_user_id: authUserId })
            .eq('id', payment.customer_id);
        }
      }

      // 2. Approve payment
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          bank_transaction_ref,
          verified_by: adminUser.id,
          verified_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update payment' },
          { status: 500 }
        );
      }

      // 3. Create subscription
      let planName = 'Gói dịch vụ';
      let subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      if (payment.metadata && payment.metadata.plan_id) {
        const planId = payment.metadata.plan_id as string;
        const durationMonths = payment.metadata.duration_months as number;
        const tier = payment.metadata.tier as string;
        planName = payment.metadata.plan_name as string;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);
        subscriptionEndDate = endDate;

        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            customer_id: payment.customer_id,
            plan_id: planId,
            tier,
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            auto_renew: true,
          });

        if (subError) {
          console.error('Failed to create subscription:', subError);
        } else {
          // Update customer tier
          await supabase
            .from('customers')
            .update({ tier })
            .eq('id', payment.customer_id);
        }
      }

      // 4. Send Confirmation Email with Credentials
      try {
        const emailHtml = await render(
          PaymentConfirmedEmail({
            customerName: payment.customer.full_name,
            planName: planName,
            amount: payment.amount,
            paymentCode: payment.payment_code,
            subscriptionEndDate: subscriptionEndDate.toISOString(),
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/customer`,
            credentials: generatedCredentials || undefined,
          })
        );

        await sendEmail({
          to: payment.customer.email,
          subject: 'Thanh toán thành công & Thông tin tài khoản - HoiQuanPlex',
          html: emailHtml,
          emailType: 'subscription_confirmation',
          customerId: payment.customer.id,
          templateName: 'payment-confirmed',
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue even if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified, account created, and email sent',
      });
    } else if (action === 'reject') {
      // Reject payment
      const { rejection_reason } = body;

      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'cancelled',
          rejection_reason,
          verified_by: adminUser.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update payment' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}