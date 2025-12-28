import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getActiveSubscription } from '@/lib/auth/customer-auth-helpers';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default async function CustomerSubscriptionPage() {
  const subscription = await getActiveSubscription();

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  };

  const tierColors = {
    free: 'bg-gray-100 text-gray-800 border-gray-200',
    basic: 'bg-blue-100 text-blue-800 border-blue-200',
    pro: 'bg-purple-100 text-purple-800 border-purple-200',
  };

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
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Gói dịch vụ của bạn</h1>

        {!subscription ? (
          /* No Active Subscription */
          <div className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-4xl">📦</span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Chưa có gói dịch vụ nào
            </h2>
            <p className="mb-6 text-gray-600">
              Bạn chưa đăng ký gói dịch vụ nào. Vui lòng liên hệ để đăng ký.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:support@hoiquanplex.site"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Liên hệ hỗ trợ
              </a>
              <a
                href="/register/form-a"
                className="rounded-lg border-2 border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Đăng ký mới
              </a>
            </div>
          </div>
        ) : (
          /* Active Subscription Details */
          <div className="space-y-6">
            {/* Subscription Overview Card */}
            <div className={`rounded-lg border-2 p-8 ${tierColors[subscription.tier]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-3xl font-bold">{subscription.plan.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[subscription.status as keyof typeof statusColors]}`}>
                      {statusLabels[subscription.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <p className="text-lg font-medium">
                    Gói {tierLabels[subscription.tier]}
                  </p>
                  {subscription.plan.description && (
                    <p className="mt-2 text-sm opacity-90">
                      {subscription.plan.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium opacity-80">Giá trị gói</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(subscription.plan.price, 'VND')}
                  </p>
                  <p className="text-sm opacity-80">
                    {subscription.plan.duration_months} tháng
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi tiết gói dịch vụ
                </h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Mã đăng ký</dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900">
                      {subscription.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(subscription.start_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ngày kết thúc</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(subscription.end_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Thời hạn</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {subscription.plan.duration_months} tháng
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[subscription.status as keyof typeof statusColors]}`}>
                        {statusLabels[subscription.status as keyof typeof statusLabels]}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gói hiện tại</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[subscription.tier]}`}>
                        {tierLabels[subscription.tier]}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Plan Features */}
            {subscription.plan.features && (
              <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tính năng gói dịch vụ
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {(subscription.plan.features as string[]).map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 text-green-500">✓</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="rounded-lg bg-blue-50 p-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Cần hỗ trợ?
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Nếu bạn có câu hỏi về gói dịch vụ hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi.
              </p>
              <a
                href="mailto:support@hoiquanplex.site"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
