'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/admin');
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/admin/login');
}

/**
 * Sign in with email and password (returns response instead of redirecting)
 * Useful for client-side handling
 */
export async function signInWithCredentials(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Check if user is an admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (adminError || !adminUser) {
    // Sign out if not an admin
    await supabase.auth.signOut();
    return { success: false, error: 'Access denied. Admin account required.' };
  }

  revalidatePath('/', 'layout');
  return { success: true, role: adminUser.role };
}
