import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SubscriptionActions } from '@/components/admin/subscription-actions';

export default async function AdminSubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch subscription with related data
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      customer:customers(*),
      plan:subscription_plans(*)
    `)
    .eq('id', id)
    .single();

  if (error || !subscription) {
    notFound();
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
  };

  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
  };

  const daysUntilExpiry = Math.ceil(
    (new Date(subscription.end_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <AdminDashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <Link
              href="/admin/subscriptions"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to Subscriptions
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subscription Details
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {(subscription.customer as { full_name: string }).full_name} - {(subscription.plan as { name: string }).name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/admin/subscriptions/${subscription.id}/edit`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Edit Subscription
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Subscription Info */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Subscription Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {(subscription.plan as { name: string }).name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tier</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[subscription.tier as keyof typeof tierColors]}`}>
                    {subscription.tier}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[subscription.status as keyof typeof statusColors]}`}>
                    {subscription.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency((subscription.plan as { price: number }).price, 'VND')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(subscription.plan as { duration_months: number }).duration_months} months
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Auto-Renew</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {subscription.auto_renew ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(subscription.start_date)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(subscription.end_date)}
                  {subscription.status === 'active' && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'})
                    </span>
                  )}
                </dd>
              </div>
              {subscription.cancelled_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cancelled At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(subscription.cancelled_at)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(subscription.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Subscription ID</dt>
                <dd className="mt-1 font-mono text-xs text-gray-900">
                  {subscription.id}
                </dd>
              </div>
            </dl>
          </div>

          {/* Customer Info */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Customer Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {(subscription.customer as { full_name: string }).full_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(subscription.customer as { email: string }).email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(subscription.customer as { phone: string | null }).phone || '-'}
                </dd>
              </div>
              <div className="pt-3">
                <Link
                  href={`/admin/customers/${(subscription.customer as { id: string }).id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View Customer Profile →
                </Link>
              </div>
            </dl>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <SubscriptionActions subscription={subscription} />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
