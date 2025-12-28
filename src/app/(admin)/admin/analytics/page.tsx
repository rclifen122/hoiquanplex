import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/format';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // Fetch all subscriptions with plan details
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(price, duration_months)
    `);

  // Fetch all customers
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at');

  // Fetch all payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'succeeded');

  // Calculate MRR (Monthly Recurring Revenue)
  const activeSubscriptions = subscriptions?.filter((s) => s.status === 'active') || [];
  const mrr = activeSubscriptions.reduce((total, sub) => {
    const plan = sub.plan as { price: number; duration_months: number };
    const monthlyRevenue = plan.price / plan.duration_months;
    return total + monthlyRevenue;
  }, 0);

  // Calculate ARR (Annual Recurring Revenue)
  const arr = mrr * 12;

  // Total revenue from all successful payments
  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  // Customer metrics
  const totalCustomers = customers?.length || 0;
  const activeCustomers = customers?.filter((c) => c.status === 'active').length || 0;

  // Calculate customer growth (new customers this month vs last month)
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const customersThisMonth = customers?.filter(
    (c) => new Date(c.created_at) >= startOfThisMonth
  ).length || 0;

  const customersLastMonth = customers?.filter(
    (c) =>
      new Date(c.created_at) >= startOfLastMonth &&
      new Date(c.created_at) <= endOfLastMonth
  ).length || 0;

  const customerGrowth =
    customersLastMonth > 0
      ? ((customersThisMonth - customersLastMonth) / customersLastMonth) * 100
      : 0;

  // Tier distribution
  const tierDistribution = {
    free: customers?.filter((c) => c.tier === 'free').length || 0,
    basic: customers?.filter((c) => c.tier === 'basic').length || 0,
    pro: customers?.filter((c) => c.tier === 'pro').length || 0,
  };

  // Subscription status distribution
  const subscriptionStatus = {
    active: subscriptions?.filter((s) => s.status === 'active').length || 0,
    past_due: subscriptions?.filter((s) => s.status === 'past_due').length || 0,
    cancelled: subscriptions?.filter((s) => s.status === 'cancelled').length || 0,
    expired: subscriptions?.filter((s) => s.status === 'expired').length || 0,
  };

  // Calculate churn rate (cancelled + expired subscriptions / total subscriptions)
  const totalSubscriptions = subscriptions?.length || 0;
  const churnedSubscriptions =
    (subscriptionStatus.cancelled + subscriptionStatus.expired) || 0;
  const churnRate =
    totalSubscriptions > 0 ? (churnedSubscriptions / totalSubscriptions) * 100 : 0;

  // Average revenue per customer
  const arpc = activeCustomers > 0 ? totalRevenue / activeCustomers : 0;

  return (
    <AdminDashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Business metrics and performance insights
          </p>
        </div>

        {/* Revenue Metrics */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Revenue Metrics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Monthly Recurring Revenue</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(mrr, 'VND')}</p>
              <p className="mt-1 text-xs opacity-75">MRR</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Annual Recurring Revenue</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(arr, 'VND')}</p>
              <p className="mt-1 text-xs opacity-75">ARR (MRR × 12)</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(totalRevenue, 'VND')}</p>
              <p className="mt-1 text-xs opacity-75">All-time</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Avg Revenue / Customer</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(arpc, 'VND')}</p>
              <p className="mt-1 text-xs opacity-75">ARPC</p>
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Customer Metrics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{activeCustomers}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{customersThisMonth}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {customerGrowth >= 0 ? '+' : ''}
                {customerGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tier Distribution */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Tier Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Free</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {tierDistribution.free} ({((tierDistribution.free / totalCustomers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gray-500"
                    style={{
                      width: `${(tierDistribution.free / totalCustomers) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Basic</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {tierDistribution.basic} ({((tierDistribution.basic / totalCustomers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${(tierDistribution.basic / totalCustomers) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Pro</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {tierDistribution.pro} ({((tierDistribution.pro / totalCustomers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{
                      width: `${(tierDistribution.pro / totalCustomers) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Subscription Status</h2>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Active</span>
                  <span className="text-sm font-semibold text-green-600">
                    {subscriptionStatus.active}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${(subscriptionStatus.active / totalSubscriptions) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Past Due</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {subscriptionStatus.past_due}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{
                      width: `${(subscriptionStatus.past_due / totalSubscriptions) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Cancelled</span>
                  <span className="text-sm font-semibold text-gray-600">
                    {subscriptionStatus.cancelled}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gray-400"
                    style={{
                      width: `${(subscriptionStatus.cancelled / totalSubscriptions) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Expired</span>
                  <span className="text-sm font-semibold text-red-600">
                    {subscriptionStatus.expired}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{
                      width: `${(subscriptionStatus.expired / totalSubscriptions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Churn Rate</span>
                <span className="text-lg font-bold text-red-600">
                  {churnRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
