import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getActiveSubscription } from '@/lib/auth/customer-auth-helpers';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/server';
import { PlanSelection, type Plan } from '@/components/subscription/plan-selection';
import { ShieldCheck, Zap } from 'lucide-react';

export default async function CustomerSubscriptionPage() {
  const subscription = await getActiveSubscription();
  const supabase = await createClient();

  // Fetch available plans
  const { data: rawPlans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .eq('subscription_type', 'account')
    .order('price', { ascending: true });

  // Filter and enhance plans
  // 1. Remove 1 month plan (price < 100k)
  // 2. Highlight 12 month plan
  // 3. Parse Name/Duration for new UI layout (e.g. "Plus 3 Tháng" -> Name: "Plus", Duration: "3 Tháng")
  const plans = (rawPlans || [])
    .filter(p => p.price > 100000)
    .map((p, index, array) => {
      // Simple parse: Assumes format "Name Duration..."
      // We want "Plus" and "3 Tháng"
      // Regex: First word is Name (Plus/Pro/Max), rest is Duration
      const match = p.name.match(/^(\w+)\s+(.+)$/);
      const displayName = match ? match[1] : p.name;
      const displayDuration = match ? match[2] : undefined;

      return {
        ...p,
        name: displayName,
        durationTitle: displayDuration,
        highlighted: index === array.length - 1
      };
    });



  const statusLabels = {
    active: 'Đang hoạt động',
    past_due: 'Quá hạn thanh toán',
    cancelled: 'Đã hủy',
    expired: 'Đã hết hạn',
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    past_due: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <CustomerDashboardLayout>
      <div className="space-y-12 pb-12 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">Gói dịch vụ</h1>
          <p className="mt-2 text-gray-400">Quản lý gói đăng ký và nâng cấp tài khoản của bạn.</p>
        </div>

        {/* Active Subscription Section */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-plex-yellow/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-plex-yellow" />
            Gói hiện tại
          </h2>

          {!subscription ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <p className="text-gray-400">Bạn đang sử dụng gói <span className="text-white font-semibold">Miễn phí</span>.</p>
              <p className="text-sm text-gray-500 mt-1">Nâng cấp ngay để mở khóa toàn bộ tính năng.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
              <div className="border-b border-white/10 px-6 py-4 flex justify-between items-center bg-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {subscription.plan.name}
                  {subscription.plan.name.toLowerCase().includes('pro') && <Zap className="h-4 w-4 text-plex-yellow fill-current" />}
                </h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusColors[subscription.status as keyof typeof statusColors]}`}>
                  {statusLabels[subscription.status as keyof typeof statusLabels]}
                </span>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ngày hết hạn</dt>
                    <dd className="mt-1 text-sm font-medium text-white">{formatDate(subscription.end_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Giá trị</dt>
                    <dd className="mt-1 text-sm font-medium text-white">{formatCurrency(subscription.plan.price)}/tháng</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                    <dd className="mt-1 text-sm font-medium text-white capitalize">{subscription.status}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Section */}
        <div>
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-3">Nâng cấp trải nghiệm của bạn</h2>
            <p className="text-gray-400">Chọn gói dịch vụ phù hợp để mở khóa 4K, HDR và nhiều tính năng hấp dẫn khác.</p>
          </div>

          <PlanSelection
            plans={(plans as Plan[]) || []}
            activeSubscription={subscription}
          />
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
