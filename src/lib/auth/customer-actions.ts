'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCustomer } from './customer-auth-helpers';
import { z } from 'zod';

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  facebook_profile: z.string().url('URL Facebook không hợp lệ').optional().or(z.literal('')),
});

/**
 * Update customer profile
 */
export async function updateCustomerProfile(data: {
  full_name: string;
  phone?: string;
  facebook_profile?: string;
}) {
  try {
    const customer = await getCustomer();
    if (!customer) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate data
    const validationResult = updateProfileSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      };
    }

    const supabase = await createClient();

    // Update customer profile
    const { error } = await supabase
      .from('customers')
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        facebook_profile: data.facebook_profile || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/customer/profile');
    revalidatePath('/customer');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update customer avatar URL
 */
export async function updateCustomerAvatar(avatarUrl: string) {
  try {
    const customer = await getCustomer();
    if (!customer) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('customers')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/customer/profile');
    revalidatePath('/customer');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Request email change
 * This will send a verification email to the new address
 */
export async function requestEmailChange(newEmail: string) {
  try {
    const customer = await getCustomer();
    if (!customer) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate email
    const emailSchema = z.string().email('Email không hợp lệ');
    const validationResult = emailSchema.safeParse(newEmail);
    if (!validationResult.success) {
      return { success: false, error: 'Email không hợp lệ' };
    }

    const supabase = await createClient();

    // Check if email is already in use
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', newEmail)
      .single();

    if (existingCustomer) {
      return { success: false, error: 'Email đã được sử dụng' };
    }

    // Update email using Supabase Auth
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Email xác nhận đã được gửi đến địa chỉ mới',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
