import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  // Fetch all subscriptions with customer and plan info
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      customer:customers(
        id,
        full_name,
        email
      ),
      plan:subscription_plans(
        name,
        price,
        duration_months
      )
    `)
    .order('created_at', { ascending: false });

  // Calculate stats
  const totalSubscriptions = subscriptions?.length || 0;
  const activeSubscriptions = subscriptions?.filter((s) => s.status === 'active').length || 0;
  const expiringSubscriptions = subscriptions?.filter((s) => {
    if (s.status !== 'active') return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(s.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }).length || 0;

  const expiredSubscriptions = subscriptions?.filter((s) => s.status === 'expired').length || 0;
  const cancelledSubscriptions = subscriptions?.filter((s) => s.status === 'cancelled').length || 0;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    active: 'Active',
    past_due: 'Past Due',
    cancelled: 'Cancelled',
    expired: 'Expired',
  };

  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
  };

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  };

  return (
    <AdminDashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage customer subscriptions and renewals
            </p>
          </div>
          <Link
            href="/admin/subscriptions/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Create Subscription
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Total Subscriptions</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalSubscriptions}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Active</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{activeSubscriptions}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Expiring Soon</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{expiringSubscriptions}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Expired</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{expiredSubscriptions}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="mt-1 text-2xl font-bold text-gray-600">{cancelledSubscriptions}</p>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Subscriptions ({totalSubscriptions})
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
                      No subscriptions yet
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => {
                    const daysUntilExpiry = Math.ceil(
                      (new Date(subscription.end_date).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const isExpiringSoon =
                      subscription.status === 'active' &&
                      daysUntilExpiry <= 7 &&
                      daysUntilExpiry > 0;

                    return (
                      <tr
                        key={subscription.id}
                        className={`hover:bg-gray-50 ${
                          isExpiringSoon ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {(subscription.customer as { full_name: string })?.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(subscription.customer as { email: string })?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {(subscription.plan as { name: string })?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(
                                (subscription.plan as { price: number })?.price || 0,
                                'VND'
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              tierColors[subscription.tier as keyof typeof tierColors]
                            }`}
                          >
                            {tierLabels[subscription.tier as keyof typeof tierLabels]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              statusColors[subscription.status as keyof typeof statusColors]
                            }`}
                          >
                            {statusLabels[subscription.status as keyof typeof statusLabels]}
                          </span>
                          {isExpiringSoon && (
                            <div className="mt-1 text-xs text-yellow-700">
                              Expires in {daysUntilExpiry} days
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatDate(subscription.start_date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatDate(subscription.end_date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/subscriptions/${subscription.id}`}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/subscriptions/${subscription.id}/edit`}
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
