import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { CustomerForm } from '@/components/admin/customer-form';
import Link from 'next/link';

export default function AdminNewCustomerPage() {
  return (
    <AdminDashboardLayout>
      <div>
        <div className="mb-6">
          <Link
            href="/admin/customers"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Back to Customers
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a new customer account manually
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <CustomerForm mode="create" />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
