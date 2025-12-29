import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth/auth-helpers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminUser();

  // Redirect to login if not authenticated as admin
  // The login page itself will handle the redirect if user is already authenticated
  if (!adminUser) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
