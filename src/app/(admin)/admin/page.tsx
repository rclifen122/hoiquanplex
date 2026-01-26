import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { Users, PackagePlus, CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/format';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Total Customers
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  // 2. Active Subscriptions
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 3. Pending Payments (Assuming 'payments' table has status 'pending')
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 4. Revenue (Mock for now, or sum if feasible with RPC)
  // For now, let's just count total successful payments as a proxy or use a placeholder
  // Real implementation would require a .rpc() call or summing in JS after fetching (expensive)
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(100); // Limit to last 100 for basic estimate

  const estimatedRevenue = recentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const stats = [
    {
      name: 'Total Customers',
      value: totalCustomers?.toString() || '0',
      icon: Users,
      change: 'Lifetime',
      changeType: 'neutral',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      name: 'Active Subscriptions',
      value: activeSubscriptions?.toString() || '0',
      icon: PackagePlus,
      change: 'Live',
      changeType: 'increase',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      name: 'Pending Payments',
      value: pendingPayments?.toString() || '0',
      icon: CreditCard,
      change: 'Action Needed',
      changeType: pendingPayments && pendingPayments > 0 ? 'decrease' : 'neutral',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      name: 'Est. Revenue (Last 100)',
      value: formatCurrency(estimatedRevenue),
      icon: TrendingUp,
      change: 'Recent',
      changeType: 'increase',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <AdminDashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-gray-400">
            Welcome back to <span className="text-plex-yellow font-bold">HoiQuanPlex</span> Command Center
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="group relative overflow-hidden rounded-2xl bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 transition-all hover:bg-white/10 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {stat.name}
                    </p>
                    <p className="mt-2 text-3xl font-black text-white tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {stat.changeType === 'increase' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                  <span className={`text-sm font-bold ${stat.changeType === 'decrease' ? 'text-red-400' : 'text-gray-500'
                    }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin/customers"
              className="group flex items-center gap-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition-all hover:bg-plex-yellow hover:text-black"
            >
              <div className="rounded-xl bg-blue-500/20 p-4 ring-1 ring-blue-500/40 group-hover:bg-black/10 group-hover:ring-black/20 transition-colors">
                <Users className="h-8 w-8 text-blue-400 group-hover:text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Manage Customers</h3>
                <p className="text-sm text-gray-400 group-hover:text-black/70">
                  View full list & details
                </p>
              </div>
            </a>

            <a
              href="/admin/payments"
              className="group flex items-center gap-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition-all hover:bg-plex-yellow hover:text-black"
            >
              <div className="rounded-xl bg-green-500/20 p-4 ring-1 ring-green-500/40 group-hover:bg-black/10 group-hover:ring-black/20 transition-colors">
                <CreditCard className="h-8 w-8 text-green-400 group-hover:text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Verify Payments</h3>
                <p className="text-sm text-gray-400 group-hover:text-black/70">
                  {pendingPayments} pending requests
                </p>
              </div>
            </a>

            <a
              href="/admin/subscriptions"
              className="group flex items-center gap-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition-all hover:bg-plex-yellow hover:text-black"
            >
              <div className="rounded-xl bg-purple-500/20 p-4 ring-1 ring-purple-500/40 group-hover:bg-black/10 group-hover:ring-black/20 transition-colors">
                <PackagePlus className="h-8 w-8 text-purple-400 group-hover:text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Subscriptions</h3>
                <p className="text-sm text-gray-400 group-hover:text-black/70">
                  {activeSubscriptions} active plans
                </p>
              </div>
            </a>
          </div>
        </div>

      </div>
    </AdminDashboardLayout>
  );
}

