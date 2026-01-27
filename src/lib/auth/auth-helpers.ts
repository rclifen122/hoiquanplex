import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Check if the current user is an admin
 * Returns the admin user data if they are an admin, null otherwise
 */
export async function getAdminUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Use admin client to bypass RLS when checking for admin status
  // This avoids circular dependency issues with RLS policies
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = await createAdminClient();

  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !adminUser) {
    return null;
  }

  return {
    ...adminUser,
    email: user.email!,
  };
}

/**
 * Check if the current user has a specific admin role
 */
export async function hasAdminRole(
  requiredRole: 'viewer' | 'admin' | 'super_admin'
) {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    return false;
  }

  const roleHierarchy = {
    viewer: 1,
    admin: 2,
    super_admin: 3,
  };

  const userRoleLevel = roleHierarchy[adminUser.role as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  return userRoleLevel >= requiredRoleLevel;
}

