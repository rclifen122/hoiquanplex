import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getActiveSubscription } from '@/lib/auth/customer-auth-helpers';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/server';
import { PlanSelection, type Plan } from '@/components/subscription/plan-selection';

export default async function CustomerSubscriptionPage() {
  const subscription = await getActiveSubscription();
  const supabase = await createClient();

  // Fetch available plans
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  const activePlanId = subscription?.plan_id;

  const statusLabels = {
    active: 'Đang hoạt động',
    past_due: 'Quá hạn thanh toán',
    cancelled: 'Đã hủy',
    expired: 'Đã hết hạn',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
  };

  return (
    <CustomerDashboardLayout>
      <div className="space-y-12">
        {/* Active Subscription Section */}
        <div>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Gói dịch vụ của bạn</h1>

          {!subscription ? (
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-gray-600">Bạn đang sử dụng gói miễn phí.</p>
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {subscription.plan.name}
                </h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[subscription.status as keyof typeof statusColors]}`}>
                  {statusLabels[subscription.status as keyof typeof statusLabels]}
                </span>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ngày hết hạn</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(subscription.end_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Giá trị</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatCurrency(subscription.plan.price)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                    <dd className="mt-1 text-sm text-gray-900 text-capitalize">{subscription.status}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Nâng cấp gói dịch vụ</h2>
          <p className="mb-8 text-gray-600">Chọn gói dịch vụ phù hợp để mở khóa thêm nhiều tính năng hấp dẫn.</p>

          <PlanSelection
            plans={(plans as Plan[]) || []}
            currentPlanId={activePlanId}
          />
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
