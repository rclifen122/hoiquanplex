import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createAdminClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

export default async function AdminSubscriptionsPage() {
  const supabase = await createAdminClient();

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
    active: 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30',
    past_due: 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/30',
    cancelled: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/30',
    expired: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30',
  };

  const statusLabels = {
    active: 'Active',
    past_due: 'Past Due',
    cancelled: 'Cancelled',
    expired: 'Expired',
  };

  const tierColors = {
    free: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/30',
    basic: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30',
    pro: 'bg-fuchsia-500/10 text-fuchsia-400 ring-1 ring-fuchsia-500/30',
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
            <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage customer subscriptions and renewals
            </p>
          </div>
          <Link
            href="/admin/subscriptions/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
          >
            + Create Subscription
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-gray-900/40 p-5 border border-white/5 backdrop-blur-md">
            <p className="text-sm font-medium text-gray-400">Total</p>
            <p className="mt-2 text-2xl font-black text-white">{totalSubscriptions}</p>
          </div>
          <div className="rounded-xl bg-green-500/10 p-5 border border-green-500/20 backdrop-blur-md">
            <p className="text-sm font-medium text-green-400">Active</p>
            <p className="mt-2 text-2xl font-black text-white">{activeSubscriptions}</p>
          </div>
          <div className="rounded-xl bg-yellow-500/10 p-5 border border-yellow-500/20 backdrop-blur-md">
            <p className="text-sm font-medium text-yellow-400">Expiring Soon</p>
            <p className="mt-2 text-2xl font-black text-white">{expiringSubscriptions}</p>
          </div>
          <div className="rounded-xl bg-red-500/10 p-5 border border-red-500/20 backdrop-blur-md">
            <p className="text-sm font-medium text-red-400">Expired</p>
            <p className="mt-2 text-2xl font-black text-white">{expiredSubscriptions}</p>
          </div>
          <div className="rounded-xl bg-gray-800/40 p-5 border border-white/5 backdrop-blur-md">
            <p className="text-sm font-medium text-gray-400">Cancelled</p>
            <p className="mt-2 text-2xl font-black text-white">{cancelledSubscriptions}</p>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="rounded-xl bg-gray-900/50 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              All Subscriptions
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
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
                        className={`hover:bg-white/5 transition-colors ${isExpiringSoon ? 'bg-yellow-500/5' : ''
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">
                              {(subscription.customer as { full_name: string })?.full_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(subscription.customer as { email: string })?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-300">
                              {(subscription.plan as { name: string })?.name}
                            </div>
                            <div className="text-sm text-plex-yellow font-mono">
                              {formatCurrency(
                                (subscription.plan as { price: number })?.price || 0,
                                'VND'
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[subscription.tier as keyof typeof tierColors] || 'bg-gray-500/10 text-gray-400'
                              }`}
                          >
                            {tierLabels[subscription.tier as keyof typeof tierLabels] || subscription.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[subscription.status as keyof typeof statusColors] || 'bg-gray-500/10 text-gray-400'
                              }`}
                          >
                            {statusLabels[subscription.status as keyof typeof statusLabels] || subscription.status}
                          </span>
                          {isExpiringSoon && (
                            <div className="mt-1 text-xs text-yellow-500 font-bold">
                              Expires in {daysUntilExpiry} days
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                          {formatDate(subscription.start_date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                          {formatDate(subscription.end_date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex space-x-3">
                            <Link
                              href={`/admin/subscriptions/${subscription.id}`}
                              className="text-blue-400 hover:text-blue-300 font-medium"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/subscriptions/${subscription.id}/edit`}
                              className="text-gray-500 hover:text-white transition-colors"
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
