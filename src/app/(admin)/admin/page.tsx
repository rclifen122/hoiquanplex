import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { Users, PackagePlus, CreditCard, TrendingUp } from 'lucide-react';

export default async function AdminDashboardPage() {
  // TODO: Fetch real data from Supabase
  const stats = [
    {
      name: 'Total Customers',
      value: '0',
      icon: Users,
      change: '+0%',
      changeType: 'increase',
    },
    {
      name: 'Active Subscriptions',
      value: '0',
      icon: PackagePlus,
      change: '+0%',
      changeType: 'increase',
    },
    {
      name: 'Pending Payments',
      value: '0',
      icon: CreditCard,
      change: '0',
      changeType: 'neutral',
    },
    {
      name: 'Monthly Revenue',
      value: '0 VND',
      icon: TrendingUp,
      change: '+0%',
      changeType: 'increase',
    },
  ];

  return (
    <AdminDashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to HoiQuanPlex CRM Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'increase'
                      ? 'text-green-600'
                      : stat.changeType === 'decrease'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600"> from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/customers"
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="rounded-lg bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Manage Customers</h3>
              <p className="text-sm text-gray-600">
                View and manage customer accounts
              </p>
            </div>
          </a>

          <a
            href="/admin/payments"
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="rounded-lg bg-green-100 p-3">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Verify Payments</h3>
              <p className="text-sm text-gray-600">
                Review pending payment requests
              </p>
            </div>
          </a>

          <a
            href="/admin/subscriptions"
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="rounded-lg bg-purple-100 p-3">
              <PackagePlus className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Subscriptions</h3>
              <p className="text-sm text-gray-600">
                Monitor active subscriptions
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Getting Started */}
      <div className="mt-8 rounded-xl bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-blue-900">
          🚀 Getting Started
        </h2>
        <p className="mt-2 text-sm text-blue-700">
          The admin dashboard is ready! Next steps:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-blue-700">
          <li>• Configure environment variables in Vercel</li>
          <li>• Create your first admin user in Supabase</li>
          <li>• Set up email service (Resend)</li>
          <li>• Add bank transfer details</li>
          <li>• Build customer management features</li>
        </ul>
      </div>
    </AdminDashboardLayout>
  );
}
