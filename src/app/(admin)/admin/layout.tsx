import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current path to avoid redirect loops
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';

  // Don't check auth on login page (prevent redirect loop)
  if (pathname.includes('/admin/login')) {
    return <>{children}</>;
  }

  const adminUser = await getAdminUser();

  // Redirect to login if not authenticated as admin
  if (!adminUser) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
