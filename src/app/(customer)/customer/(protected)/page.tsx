import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getCustomer, getActiveSubscription } from '@/lib/auth/customer-auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Package, CreditCard, Clock, User, ArrowRight, ExternalLink } from 'lucide-react';

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
    free: 'Free Plan',
    basic: 'Basic Plan',
    pro: 'Pro Plan',
  };

  const statusLabels = {
    active: 'Hoạt động',
    inactive: 'Chưa kích hoạt',
    suspended: 'Tạm ngưng',
  };

  const statusColors = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <CustomerDashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-white glow-text">Tổng quan</h1>
          <p className="text-sm text-gray-400">Chào mừng trở lại, {customer?.full_name}</p>
        </div>

        {/* Customer Info Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Account Status */}
          <div className="glass-card hover-glow rounded-xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Trạng thái tài khoản</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">
                    {customer && tierLabels[customer.tier]}
                  </p>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <User className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                customer && statusColors[customer.status]
              )}>
                {customer && statusLabels[customer.status]}
              </span>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="glass-card hover-glow rounded-xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Gói dịch vụ</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {subscription ? subscription.plan.name : 'Chưa đăng ký'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/customer/subscription"
                className="group flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Xem chi tiết
                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="glass-card hover-glow rounded-xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Thanh toán chờ xử lý</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {pendingPayments?.length || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-plex-yellow/10 text-plex-yellow ring-1 ring-plex-yellow/20">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            {pendingPayments && pendingPayments.length > 0 && (
              <div className="mt-4">
                <Link
                  href="/customer/payments"
                  className="group flex items-center text-sm font-medium text-plex-yellow hover:text-plex-yellow/80"
                >
                  Xử lý ngay
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/customer/subscription"
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <span className="text-sm font-medium text-gray-200">Xem gói dịch vụ</span>
              <Package className="h-5 w-5 text-purple-400" />
            </Link>
            <Link
              href="/customer/payments"
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <span className="text-sm font-medium text-gray-200">Lịch sử thanh toán</span>
              <CreditCard className="h-5 w-5 text-blue-400" />
            </Link>
            <Link
              href="/customer/profile"
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-green-500/10"
            >
              <span className="text-sm font-medium text-gray-200">Cập nhật hồ sơ</span>
              <User className="h-5 w-5 text-green-400" />
            </Link>
            <a
              href="mailto:support@hoiquanplex.site"
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-plex-yellow/10"
            >
              <span className="text-sm font-medium text-gray-200">Liên hệ hỗ trợ</span>
              <ExternalLink className="h-5 w-5 text-plex-yellow" />
            </a>
          </div>
        </div>

        {/* Recent Payments Table */}
        {recentPayments && recentPayments.length > 0 && (
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Thanh toán gần đây
              </h2>
              <Link
                href="/customer/payments"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Xem tất cả
              </Link>
            </div>
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
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="group hover:bg-white/5 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white group-hover:text-plex-yellow transition-colors">
                        {payment.payment_code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium border",
                          payment.status === 'succeeded'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : payment.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : payment.status === 'failed'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        )}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
