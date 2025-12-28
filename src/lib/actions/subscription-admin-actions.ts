'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { z } from 'zod';

const subscriptionSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  plan_id: z.string().uuid('Invalid plan ID'),
  start_date: z.string(),
  end_date: z.string(),
  auto_renew: z.boolean(),
});

/**
 * Create a new subscription (admin only)
 */
export async function createSubscription(data: {
  customer_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate data
    const validationResult = subscriptionSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message || 'Validation error',
      };
    }

    const supabase = await createClient();

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', data.plan_id)
      .single();

    if (planError || !plan) {
      return { success: false, error: 'Plan not found' };
    }

    // Create subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        customer_id: data.customer_id,
        plan_id: data.plan_id,
        tier: plan.tier,
        subscription_type: plan.subscription_type,
        start_date: data.start_date,
        end_date: data.end_date,
        auto_renew: data.auto_renew,
        status: 'active',
        device_count: plan.subscription_type === 'device' ? 1 : null,
      })
      .select()
      .single();

    if (subscriptionError) {
      return { success: false, error: subscriptionError.message };
    }

    // Update customer tier
    await supabase
      .from('customers')
      .update({ tier: plan.tier })
      .eq('id', data.customer_id);

    revalidatePath('/admin/subscriptions');
    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${data.customer_id}`);

    return { success: true, subscriptionId: subscription.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update subscription (admin only)
 */
export async function updateSubscription(
  subscriptionId: string,
  data: {
    end_date: string;
    auto_renew: boolean;
    status: 'active' | 'past_due' | 'cancelled' | 'expired';
  }
) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Get current subscription
    const { data: currentSubscription } = await supabase
      .from('subscriptions')
      .select('customer_id, tier')
      .eq('id', subscriptionId)
      .single();

    // Update subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({
        end_date: data.end_date,
        auto_renew: data.auto_renew,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (error) {
      return { success: false, error: error.message };
    }

    // If subscription is being cancelled or expired, check if customer should revert to free tier
    if (data.status === 'cancelled' || data.status === 'expired') {
      if (currentSubscription) {
        // Check if customer has any other active subscriptions
        const { data: otherActiveSubscriptions } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('customer_id', currentSubscription.customer_id)
          .neq('id', subscriptionId)
          .in('status', ['active', 'past_due']);

        if (!otherActiveSubscriptions || otherActiveSubscriptions.length === 0) {
          // Revert to free tier
          await supabase
            .from('customers')
            .update({ tier: 'free' })
            .eq('id', currentSubscription.customer_id);
        }
      }
    }

    revalidatePath('/admin/subscriptions');
    revalidatePath(`/admin/subscriptions/${subscriptionId}`);
    if (currentSubscription) {
      revalidatePath(`/admin/customers/${currentSubscription.customer_id}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cancel subscription (admin only)
 */
export async function cancelSubscription(subscriptionId: string, reason?: string) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('customer_id')
      .eq('id', subscriptionId)
      .single();

    // Update subscription status
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        metadata: {
          cancellation_reason: reason || 'Admin cancelled',
          cancelled_by_admin: adminUser.id,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Check if customer should revert to free tier
    if (subscription) {
      const { data: otherActiveSubscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('customer_id', subscription.customer_id)
        .neq('id', subscriptionId)
        .in('status', ['active', 'past_due']);

      if (!otherActiveSubscriptions || otherActiveSubscriptions.length === 0) {
        await supabase
          .from('customers')
          .update({ tier: 'free' })
          .eq('id', subscription.customer_id);
      }
    }

    revalidatePath('/admin/subscriptions');
    revalidatePath(`/admin/subscriptions/${subscriptionId}`);
    if (subscription) {
      revalidatePath(`/admin/customers/${subscription.customer_id}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extend subscription (admin only)
 */
export async function extendSubscription(
  subscriptionId: string,
  additionalMonths: number
) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Get current subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('end_date, customer_id')
      .eq('id', subscriptionId)
      .single();

    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    // Calculate new end date
    const currentEndDate = new Date(subscription.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + additionalMonths);

    // Update subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({
        end_date: newEndDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/subscriptions');
    revalidatePath(`/admin/subscriptions/${subscriptionId}`);
    revalidatePath(`/admin/customers/${subscription.customer_id}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete subscription (admin only)
 */
export async function deleteSubscription(subscriptionId: string) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('customer_id, status')
      .eq('id', subscriptionId)
      .single();

    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    if (subscription.status === 'active') {
      return {
        success: false,
        error: 'Cannot delete active subscription. Cancel it first.',
      };
    }

    // Delete subscription
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/subscriptions');
    revalidatePath(`/admin/customers/${subscription.customer_id}`);

    redirect('/admin/subscriptions');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
