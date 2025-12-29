import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getCustomer, getActiveSubscription } from '@/lib/auth/customer-auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

export default async function CustomerDashboardPage() {
  const customer = await getCustomer();
  const subscription = await getActiveSubscription();
  const supabase = await createClient();

  // Get recent payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get pending payments
  const { data: pendingPayments } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', customer?.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  };

  const statusLabels = {
    active: 'Đang hoạt động',
    inactive: 'Không hoạt động',
    suspended: 'Đã tạm ngưng',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <CustomerDashboardLayout>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Tổng quan</h1>

        {/* Customer Info Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Account Status */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trạng thái tài khoản</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {customer && tierLabels[customer.tier]}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">👤</span>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${customer && statusColors[customer.status]}`}>
                {customer && statusLabels[customer.status]}
              </span>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gói dịch vụ</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {subscription ? subscription.plan.name : 'Chưa có'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <span className="text-2xl">📦</span>
              </div>
            </div>
            {subscription && (
              <div className="mt-4">
                <Link
                  href="/customer/subscription"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Xem chi tiết →
                </Link>
              </div>
            )}
          </div>

          {/* Pending Payments */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thanh toán chờ xử lý</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {pendingPayments?.length || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            {pendingPayments && pendingPayments.length > 0 && (
              <div className="mt-4">
                <Link
                  href="/customer/payments"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Xem chi tiết →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/customer/subscription"
              className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
            >
              <span className="text-sm font-medium text-gray-900">Xem gói dịch vụ</span>
              <span className="text-xl">📦</span>
            </Link>
            <Link
              href="/customer/payments"
              className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
            >
              <span className="text-sm font-medium text-gray-900">Lịch sử thanh toán</span>
              <span className="text-xl">💳</span>
            </Link>
            <Link
              href="/customer/profile"
              className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
            >
              <span className="text-sm font-medium text-gray-900">Cập nhật hồ sơ</span>
              <span className="text-xl">✏️</span>
            </Link>
            <a
              href="mailto:support@hoiquanplex.site"
              className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
            >
              <span className="text-sm font-medium text-gray-900">Liên hệ hỗ trợ</span>
              <span className="text-xl">💬</span>
            </a>
          </div>
        </div>

        {/* Recent Payments */}
        {recentPayments && recentPayments.length > 0 && (
          <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Thanh toán gần đây
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Mã thanh toán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {payment.payment_code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
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
                        {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-200 px-6 py-4">
              <Link
                href="/customer/payments"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Xem tất cả thanh toán →
              </Link>
            </div>
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
