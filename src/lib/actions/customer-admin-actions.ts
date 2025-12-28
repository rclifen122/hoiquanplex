'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { z } from 'zod';

const customerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  facebook_profile: z.string().url('Invalid URL').optional().or(z.literal('')),
  tier: z.enum(['free', 'basic', 'pro']),
  status: z.enum(['active', 'inactive', 'suspended']),
});

/**
 * Create a new customer (admin only)
 */
export async function createCustomer(data: {
  full_name: string;
  email: string;
  phone?: string;
  facebook_profile?: string;
  tier: 'free' | 'basic' | 'pro';
  status: 'active' | 'inactive' | 'suspended';
  password: string;
}) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate data
    const validationResult = customerSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    // Check if email already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingCustomer) {
      return { success: false, error: 'Email already exists' };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to create auth user' };
    }

    // Create customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        id: authData.user.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        facebook_profile: data.facebook_profile || null,
        tier: data.tier,
        status: data.status,
        registration_source: 'manual',
      })
      .select()
      .single();

    if (customerError) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: customerError.message };
    }

    revalidatePath('/admin/customers');
    return { success: true, customerId: customer.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update customer (admin only)
 */
export async function updateCustomer(
  customerId: string,
  data: {
    full_name: string;
    email: string;
    phone?: string;
    facebook_profile?: string;
    tier: 'free' | 'basic' | 'pro';
    status: 'active' | 'inactive' | 'suspended';
  }
) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate data
    const validationResult = customerSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    // Check if email is being changed and if new email already exists
    if (data.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', data.email)
        .neq('id', customerId)
        .single();

      if (existingCustomer) {
        return { success: false, error: 'Email already exists' };
      }

      // Update auth email if changed
      await supabase.auth.admin.updateUserById(customerId, {
        email: data.email,
      });
    }

    // Update customer record
    const { error } = await supabase
      .from('customers')
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        facebook_profile: data.facebook_profile || null,
        tier: data.tier,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete customer (admin only)
 */
export async function deleteCustomer(customerId: string) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Check if customer has active subscriptions
    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('customer_id', customerId)
      .eq('status', 'active');

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      return {
        success: false,
        error: 'Cannot delete customer with active subscriptions',
      };
    }

    // Delete customer (will cascade to related records based on DB constraints)
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Delete auth user
    await supabase.auth.admin.deleteUser(customerId);

    revalidatePath('/admin/customers');
    redirect('/admin/customers');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
