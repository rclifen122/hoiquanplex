import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { CustomerForm } from '@/components/admin/customer-form';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AdminEditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !customer) {
    notFound();
  }

  return (
    <AdminDashboardLayout>
      <div>
        <div className="mb-6">
          <Link
            href={`/admin/customers/${id}`}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Back to Customer
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update customer information
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <CustomerForm mode="edit" customer={customer} />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
