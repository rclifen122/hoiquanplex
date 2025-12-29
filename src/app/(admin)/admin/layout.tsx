import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current pathname
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Don't protect the login page itself
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const adminUser = await getAdminUser();

  // Redirect to login if not authenticated as admin
  if (!adminUser) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
