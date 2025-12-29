import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current pathname
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Don't protect the login page itself
  if (pathname === '/customer/login') {
    return <>{children}</>;
  }

  const customer = await getCustomer();

  if (!customer) {
    redirect('/customer/login');
  }

  return <>{children}</>;
}
