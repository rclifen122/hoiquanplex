import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createAdminClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';

export default async function AdminSubscriptionsPage() {
  const supabase = await createAdminClient();

  // Fetch all subscriptions with customer and plan info
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      customer:customers(id, full_name, email),
      plan:subscription_plans(name)
    `)
    .order('created_at', { ascending: false });

  // Calculate stats
  const totalActive = subscriptions?.filter(s => s.status === 'active').length || 0;
  const totalCancelled = subscriptions?.filter(s => s.status === 'cancelled').length || 0;

  const tierLabels: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    plus: 'Plus',
    pro: 'Pro',
    max: 'Max',
  };

  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    plus: 'bg-cyan-100 text-cyan-800',
    pro: 'bg-purple-100 text-purple-800',
    max: 'bg-yellow-100 text-yellow-800',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    past_due: 'bg-orange-100 text-orange-800',
  };

  return (
    <AdminDashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Subscriptions</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage user subscriptions and plans
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Active Subscriptions</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{totalActive}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{totalCancelled}</p>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 bg-opacity-75 backdrop-blur backdrop-filter">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {!subscriptions || subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No active subscriptions
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {sub.customer?.full_name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">{sub.customer?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {sub.plan?.name || 'Custom'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[sub.tier] || 'bg-gray-100 text-gray-800'}`}>
                          {tierLabels[sub.tier] || sub.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(sub.start_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(sub.end_date)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex space-x-3">
                          <Link
                            href={`/admin/subscriptions/${sub.id}`}
                            className="text-blue-600 hover:text-blue-500 font-medium"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/subscriptions/${sub.id}/edit`}
                            className="text-gray-600 hover:text-gray-500"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
