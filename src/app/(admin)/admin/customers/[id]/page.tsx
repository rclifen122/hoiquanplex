import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch customer with all related data
  const { data: customer, error } = await supabase
    .from('customers')
    .select(`
      *,
      subscriptions:subscriptions(
        *,
        plan:subscription_plans(*)
      ),
      payments:payments(
        *
      ),
      form_submissions:form_submissions(
        *
      )
    `)
    .eq('id', id)
    .single();

  if (error || !customer) {
    notFound();
  }

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  };

  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  };

  const activeSubscription = customer.subscriptions?.find(
    (s: { status: string }) => s.status === 'active'
  );

  const totalPaid = customer.payments
    ?.filter((p: { status: string }) => p.status === 'succeeded')
    .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0) || 0;

  return (
    <AdminDashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <Link
              href="/admin/customers"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to Customers
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.full_name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{customer.email}</p>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/admin/customers/${customer.id}/edit`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Edit Customer
              </Link>
            </div>
          </div>
        </div>

        {/* Customer Info Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Tier</p>
            <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[customer.tier as keyof typeof tierColors]}`}>
              {tierLabels[customer.tier as keyof typeof tierLabels]}
            </span>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Status</p>
            <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[customer.status as keyof typeof statusColors]}`}>
              {customer.status}
            </span>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrency(totalPaid, 'VND')}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {formatDate(customer.created_at)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Customer Details */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Customer Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.phone || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Facebook Profile</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.facebook_profile ? (
                    <a
                      href={customer.facebook_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Registration Source</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.registration_source || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                <dd className="mt-1 font-mono text-xs text-gray-900">
                  {customer.id}
                </dd>
              </div>
            </dl>
          </div>

          {/* Active Subscription */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Active Subscription
              </h2>
              {!activeSubscription && (
                <Link
                  href={`/admin/subscriptions/new?customer_id=${customer.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  + Create Subscription
                </Link>
              )}
            </div>
            {activeSubscription ? (
              <div>
                <div className="mb-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {(activeSubscription.plan as { name: string }).name}
                    </h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[(activeSubscription as { tier: string }).tier as keyof typeof tierColors]}`}>
                      {tierLabels[(activeSubscription as { tier: string }).tier as keyof typeof tierLabels]}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency((activeSubscription.plan as { price: number }).price, 'VND')}
                  </p>
                </div>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {(activeSubscription as { status: string }).status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate((activeSubscription as { start_date: string }).start_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate((activeSubscription as { end_date: string }).end_date)}
                    </dd>
                  </div>
                  <div className="pt-3">
                    <Link
                      href={`/admin/subscriptions/${(activeSubscription as { id: string }).id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Subscription Details →
                    </Link>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No active subscription</p>
                <Link
                  href={`/admin/subscriptions/new?customer_id=${customer.id}`}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Create Subscription
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment History ({customer.payments?.length || 0})
            </h2>
          </div>
          {!customer.payments || customer.payments.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No payments yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Payment Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {customer.payments.map((payment: {
                    id: string;
                    payment_code: string;
                    amount: number;
                    currency: string;
                    status: string;
                    payment_method: string;
                    created_at: string;
                  }) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900">
                        {payment.payment_code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          payment.status === 'succeeded'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {payment.payment_method}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Link
                          href={`/admin/payments/${payment.id}`}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
