import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createAdminClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createAdminClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      customer:customers(*),
      plan:subscription_plans(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !subscription) {
    notFound();
  }

  // Fetch recent payments for this subscription/customer
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', subscription.customer_id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/subscriptions"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Subscriptions
          </Link>
          <div className="flex space-x-3">
            <Link
              href={`/admin/subscriptions/${subscription.id}/edit`}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage / Cancel
            </Link>
          </div>
        </div>

        {/* Header Card */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {subscription.plan?.name || 'Unknown Plan'}
              </h1>
              <p className="text-sm text-gray-500">ID: {subscription.id}</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${subscription.status === 'active' ? 'bg-green-100 text-green-800' :
              subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
              {subscription.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <div className="mt-2">
                <p className="font-medium text-gray-900">{subscription.customer?.full_name}</p>
                <p className="text-sm text-gray-500">{subscription.customer?.email}</p>
                <p className="text-sm text-gray-500">{subscription.customer?.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Billing Period</h3>
              <div className="mt-2 text-sm text-gray-900">
                <p>Started: {formatDate(subscription.start_date)}</p>
                <p>Ends: {formatDate(subscription.end_date)}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Auto Renew: {subscription.auto_renew ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!payments || payments.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No payments found</td></tr>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  payments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(payment.created_at)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{payment.payment_method}</td>
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
