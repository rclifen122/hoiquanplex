import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { redirect } from 'next/navigation';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCustomer();

  if (!customer) {
    redirect('/customer/login');
  }

  return (
    <div className="min-h-screen bg-cinematic text-white">
      {children}
    </div>
  );
}
