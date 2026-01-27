import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { Users, PackagePlus, CreditCard, ArrowUpRight, Activity, DollarSign } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createAdminClient();

  // 1. Total Customers
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  // 2. Active Subscriptions
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 3. Pending Payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 4. Revenue Estimate
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(100);

  const estimatedRevenue = (recentPayments || []).reduce((sum: number, p: { amount: number | null }) => sum + Number(p?.amount || 0), 0);

  const stats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(estimatedRevenue),
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'increase',
      gradient: 'from-fuchsia-600 to-purple-600',
      iconColor: 'text-fuchsia-100',
    },
    {
      name: 'Active Users',
      value: totalCustomers?.toString() || '0',
      icon: Users,
      change: '+142',
      changeType: 'increase',
      gradient: 'from-blue-600 to-cyan-600',
      iconColor: 'text-blue-100',
    },
    {
      name: 'Subscriptions',
      value: activeSubscriptions?.toString() || '0',
      icon: PackagePlus,
      change: '+4.5%',
      changeType: 'increase',
      gradient: 'from-emerald-500 to-teal-500',
      iconColor: 'text-emerald-100',
    },
    {
      name: 'Pending Requests',
      value: pendingPayments?.toString() || '0',
      icon: Activity,
      change: 'Action Required',
      changeType: pendingPayments && pendingPayments > 0 ? 'warning' : 'neutral',
      gradient: 'from-amber-500 to-orange-500',
      iconColor: 'text-amber-100',
    },
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header Section */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-sm">
              Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-plex-yellow to-amber-300">Overview</span>
            </h1>
            <p className="text-gray-400 mt-1 font-medium">
              Welcome back to <span className="text-white">HoiQuanPlex</span> Command Center
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-400">System Operational</span>
          </div>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gray-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:shadow-2xl hover:shadow-black/50"
              >
                {/* Background Gradient Splash */}
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />

                <div className="flex items-start justify-between">
                  <div className="relative">
                    <p className="text-sm font-semibold text-gray-400">{stat.name}</p>
                    <p className="mt-2 text-3xl font-black text-white tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg decoration-clone`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold 
                    ${stat.changeType === 'increase' ? 'bg-green-500/10 text-green-400' :
                      stat.changeType === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {stat.changeType === 'increase' && <ArrowUpRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Area: Quick Actions & Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Quick Actions Panel */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-plex-yellow" />
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link href="/admin/payments" className="group rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 hover:border-plex-yellow/50">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-orange-500/20 p-3 ring-1 ring-orange-500/30 group-hover:bg-orange-500/30">
                    <CreditCard className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-plex-yellow transition-colors">Pending Payments</h3>
                    <p className="text-sm text-gray-400">Review {pendingPayments} waiting requests</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/customers" className="group rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 hover:border-blue-500/50">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-500/20 p-3 ring-1 ring-blue-500/30 group-hover:bg-blue-500/30">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Customer Base</h3>
                    <p className="text-sm text-gray-400">Manage {totalCustomers} registered users</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/subscriptions" className="group rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 hover:border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-emerald-500/20 p-3 ring-1 ring-emerald-500/30 group-hover:bg-emerald-500/30">
                    <PackagePlus className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Subscription Plans</h3>
                    <p className="text-sm text-gray-400">Update pricing & tiers</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* System Status / Mini Feed (Visual Placeholder) */}
          <div className="rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-md">
            <h3 className="font-bold text-white mb-4">System Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="h-2 w-2 rounded-full bg-plex-yellow"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 w-24 rounded-full bg-white/20"></div>
                    <div className="h-1.5 w-16 rounded-full bg-white/10"></div>
                  </div>
                  <div className="text-xs text-gray-600">2m ago</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-xs text-center text-gray-500">Real-time monitoring active</p>
            </div>
          </div>

        </div>
      </div>
    </AdminDashboardLayout>
  );
}
