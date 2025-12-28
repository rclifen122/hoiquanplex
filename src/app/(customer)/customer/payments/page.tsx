import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import Link from 'next/link';

export default async function CustomerPaymentsPage() {
  const customer = await getCustomer();
  const supabase = await createClient();

  // Fetch all payments for this customer
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false });

  const paymentMethodLabels: Record<string, string> = {
    bank_transfer: 'Chuyển khoản ngân hàng',
    vnpay: 'VNPay',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    succeeded: 'Thành công',
    failed: 'Thất bại',
    refunded: 'Đã hoàn tiền',
    cancelled: 'Đã hủy',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  // Calculate stats
  const totalPaid = payments
    ?.filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const pendingCount = payments?.filter((p) => p.status === 'pending').length || 0;
  const succeededCount = payments?.filter((p) => p.status === 'succeeded').length || 0;

  return (
    <CustomerDashboardLayout>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>

        {/* Payment Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đã thanh toán</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalPaid, 'VND')}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thanh toán thành công</p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {succeededCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="mt-2 text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tất cả thanh toán ({payments?.length || 0})
            </h2>
          </div>

          {!payments || payments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <span className="text-4xl">💳</span>
              </div>
              <p className="text-gray-600">Chưa có giao dịch thanh toán nào</p>
            </div>
          ) : (
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
                      Phương thức
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-mono font-medium text-gray-900">
                        {payment.payment_code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[payment.status]}`}>
                          {statusLabels[payment.status] || payment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(payment.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {payment.status === 'pending' && (
                          <Link
                            href={`/payment/${payment.id}/status`}
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Xem chi tiết
                          </Link>
                        )}
                        {payment.status === 'succeeded' && (
                          <span className="text-gray-400">-</span>
                        )}
                        {payment.status === 'failed' && payment.metadata && (
                          <span className="text-xs text-red-600">
                            {(payment.metadata as { rejection_reason?: string }).rejection_reason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Có thắc mắc về thanh toán?
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Nếu bạn cần hỗ trợ về bất kỳ giao dịch thanh toán nào, vui lòng liên hệ với chúng tôi.
          </p>
          <a
            href="mailto:support@hoiquanplex.site"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
