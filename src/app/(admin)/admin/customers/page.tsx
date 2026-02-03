import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createAdminClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';

export default async function AdminCustomersPage() {
  const supabase = await createAdminClient();

  // Fetch all customers with their subscription info
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      subscriptions:subscriptions(
        id,
        tier,
        status,
        end_date,
        plan:subscription_plans(name)
      )
    `)
    .order('created_at', { ascending: false });

  // Calculate stats
  const totalCustomers = customers?.length || 0;
  const activeCustomers = customers?.filter((c) => c.status === 'active').length || 0;
  const freeCustomers = customers?.filter((c) => c.tier === 'free').length || 0;
  const basicCustomers = customers?.filter((c) => c.tier === 'basic').length || 0;
  const proCustomers = customers?.filter((c) => c.tier === 'pro').length || 0;

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    plus: 'Plus',
    pro: 'Pro',
    max: 'Max',
  };

  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    plus: 'bg-cyan-100 text-cyan-800',
    pro: 'bg-purple-100 text-purple-800',
    max: 'bg-yellow-100 text-yellow-800',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <AdminDashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts List</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage leads and customer identities
            </p>
          </div>
          <Link
            href="/admin/customers/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Add Customer
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalCustomers}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Active</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{activeCustomers}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Free Tier</p>
            <p className="mt-1 text-2xl font-bold text-gray-600">{freeCustomers}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Basic Tier</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{basicCustomers}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Pro Tier</p>
            <p className="mt-1 text-2xl font-bold text-purple-600">{proCustomers}</p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Customers ({totalCustomers})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {!customers || customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No customers yet
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const activeSubscription = customer.subscriptions?.find(
                      (s: { status: string }) => s.status === 'active'
                    );

                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {customer.full_name}
                            </div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{customer.phone || '-'}</div>
                          {/* Use extended type locally until DB types are regenerated */}
                          {(customer as unknown as { phone_2?: string }).phone_2 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {(customer as unknown as { phone_2?: string }).phone_2}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[customer.tier as keyof typeof tierColors]}`}>
                            {tierLabels[customer.tier as keyof typeof tierLabels]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[customer.status as keyof typeof statusColors]}`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {activeSubscription ? (
                            <div>
                              <div className="font-medium">
                                {(activeSubscription.plan as { name: string })?.name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Until {formatDate((activeSubscription as { end_date: string }).end_date)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No active subscription</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatDate(customer.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/customers/${customer.id}/edit`}
                              className="text-gray-600 hover:text-gray-500"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
