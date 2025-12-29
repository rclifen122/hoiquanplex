import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { redirect } from 'next/navigation';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCustomer();

  // Redirect to login if not authenticated as customer
  // The login page itself will handle the redirect if user is already authenticated
  if (!customer) {
    redirect('/customer/login');
  }

  return <>{children}</>;
}
