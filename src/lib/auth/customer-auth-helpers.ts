import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from './auth-helpers';

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  facebook_profile: string | null;
  tier: 'free' | 'basic' | 'pro';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string | null;
  registration_source: 'form_a' | 'form_b' | 'manual' | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get current customer from session
 * Returns customer data if authenticated, null otherwise
 */
export async function getCustomer(): Promise<Customer | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!customer) return null;

  return {
    ...customer,
    email: user.email!,
  };
}

/**
 * Check if current user has an active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const customer = await getCustomer();
  if (!customer) return false;

  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('customer_id', customer.id)
    .in('status', ['active', 'past_due'])
    .single();

  return !!subscription;
}

/**
 * Get customer's active subscription
 */
export async function getActiveSubscription() {
  const customer = await getCustomer();
  if (!customer) return null;

  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('customer_id', customer.id)
    .in('status', ['active', 'past_due'])
    .single();

  return subscription;
}
