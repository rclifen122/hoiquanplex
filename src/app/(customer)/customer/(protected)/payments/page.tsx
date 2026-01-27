import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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
    bank_transfer: 'Chuyển khoản',
    vnpay: 'VNPay',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    stripe: 'Thẻ quốc tế (Stripe)',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    succeeded: 'Thành công',
    failed: 'Thất bại',
    refunded: 'Đã hoàn tiền',
    cancelled: 'Đã hủy',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    succeeded: 'bg-green-500/10 text-green-500 border-green-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    refunded: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  // Calculate stats
  const totalPaid = payments
    ?.filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const pendingCount = payments?.filter((p) => p.status === 'pending').length || 0;
  const succeededCount = payments?.filter((p) => p.status === 'succeeded').length || 0;

  return (
    <CustomerDashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">Lịch sử thanh toán</h1>
          <p className="mt-2 text-gray-400">Theo dõi chi tiết các giao dịch của bạn.</p>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Tổng đã thanh toán</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCurrency(totalPaid, 'VND')}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Thanh toán thành công</p>
                <p className="mt-2 text-2xl font-bold text-green-500">
                  {succeededCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500 ring-1 ring-green-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Chờ xử lý</p>
                <p className="mt-2 text-2xl font-bold text-yellow-500">
                  {pendingCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Tất cả thanh toán ({payments?.length || 0})
            </h2>
          </div>

          {!payments || payments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <CreditCard className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400">Chưa có giao dịch thanh toán nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Mã thanh toán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Phương thức
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="group hover:bg-white/5 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-mono font-medium text-white group-hover:text-plex-yellow transition-colors">
                        {payment.payment_code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-200">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                          statusColors[payment.status]
                        )}>
                          {statusLabels[payment.status] || payment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {formatDateTime(payment.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {payment.status === 'pending' && (
                          <Link
                            href={`/payment/${payment.id}/status`}
                            className="font-medium text-blue-400 hover:text-blue-300"
                          >
                            Chi tiết
                          </Link>
                        )}
                        {payment.status === 'succeeded' && (
                          <span className="text-gray-600">-</span>
                        )}
                        {payment.status === 'failed' && payment.metadata && (
                          <span className="flex items-center text-xs text-red-400 gap-1">
                            <AlertCircle className="h-3 w-3" />
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
        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-6">
          <h3 className="mb-2 text-sm font-semibold text-blue-400">
            Có thắc mắc về thanh toán?
          </h3>
          <p className="mb-4 text-sm text-gray-400">
            Nếu bạn cần hỗ trợ về bất kỳ giao dịch thanh toán nào, vui lòng liên hệ với chúng tôi.
          </p>
          <a
            href="mailto:support@hoiquanplex.site"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
