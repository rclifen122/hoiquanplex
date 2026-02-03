import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getCustomer, getActiveSubscription } from '@/lib/auth/customer-auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Package, CreditCard, Clock, User, ArrowRight, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

export default async function CustomerDashboardPage() {
  const customer = await getCustomer();
  const subscription = await getActiveSubscription();
  const supabase = await createClient();

  // Parallelize payment queries
  const [
    { data: recentPayments },
    { data: pendingPayments }
  ] = await Promise.all([
    // Get recent payments
    supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customer?.id)
      .order('created_at', { ascending: false })
      .limit(5),

    // Get pending payments
    supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customer?.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
  ]);

  const tierLabels = {
    free: 'Free Explorer',
    basic: 'Basic Member',
    pro: 'Pro VIP',
  };

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <CustomerDashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">

        {/* Cinematic Header with Time-based Greeting would be ideal, static for now */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-black p-10 ring-1 ring-white/10">
          <div className="absolute top-0 right-0 p-32 bg-plex-yellow/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white glow-text mb-2">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{customer?.full_name}</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              Welcome to your personal dashboard. Your entertainment center is ready.
              {subscription ? " Enjoy your premium access." : " Upgrade to unlock the full potential."}
            </p>
          </div>
        </div>

        {/* Stats / Info Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* Account Status Card */}
          <div className="group glass-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account Tier</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-2xl font-black text-white">
                    {customer && tierLabels[customer.tier]}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-blue-500/20 p-3 ring-1 ring-blue-500/40">
                <User className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", customer?.status === 'active' ? "bg-green-500 animate-pulse" : "bg-gray-500")}></div>
              <span className="text-sm font-medium text-gray-300">
                {customer && statusLabels[customer.status]}
              </span>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="group glass-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Current Plan</p>
                <p className="mt-2 text-2xl font-black text-white">
                  {subscription ? subscription.plan.name : 'Free Access'}
                </p>
                {subscription && (
                  <p className="text-xs text-gray-400 mt-1">
                    Renews: {new Date(subscription.current_period_end).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-purple-500/20 p-3 ring-1 ring-purple-500/40">
                {subscription ? <ShieldCheck className="h-6 w-6 text-purple-400" /> : <Package className="h-6 w-6 text-purple-400" />}
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/customer/subscription"
                className="group/link flex items-center text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                {subscription ? "Manage Subscription" : "Upgrade Now"}
                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="group glass-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-plex-yellow/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Pending Actions</p>
                <p className="mt-2 text-2xl font-black text-white">
                  {pendingPayments?.length || 0}
                </p>
              </div>
              <div className="rounded-xl bg-plex-yellow/10 p-3 ring-1 ring-plex-yellow/30">
                <Clock className="h-6 w-6 text-plex-yellow" />
              </div>
            </div>
            {pendingPayments && pendingPayments.length > 0 ? (
              <div className="mt-4">
                <Link
                  href="/customer/payments"
                  className="group/link flex items-center text-sm font-bold text-plex-yellow hover:text-amber-300 transition-colors"
                >
                  Confirm Payment
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-500">All caught up</div>
            )}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="glass-card rounded-3xl p-8 backdrop-blur-xl">
          <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-plex-yellow" />
            Quick Access
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/customer/subscription", label: "Browse Plans", icon: Package, color: "text-purple-400", hoverShadow: "hover:shadow-purple-500/20" },
              { href: "/customer/payments", label: "Transaction History", icon: CreditCard, color: "text-blue-400", hoverShadow: "hover:shadow-blue-500/20" },
              { href: "/customer/profile", label: "My Profile", icon: User, color: "text-green-400", hoverShadow: "hover:shadow-green-500/20" },
              { href: "mailto:support@hoiquanplex.site", label: "Get Support", icon: ExternalLink, color: "text-plex-yellow", hoverShadow: "hover:shadow-plex-yellow/20" }
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-lg ${action.hoverShadow}`}
              >
                <span className="font-semibold text-gray-200">{action.label}</span>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Payments Table - Styled */}
        {recentPayments && recentPayments.length > 0 && (
          <div className="glass-card overflow-hidden rounded-3xl">
            <div className="border-b border-white/10 px-8 py-6 flex items-center justify-between bg-white/5">
              <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
              <Link
                href="/customer/payments"
                className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Code</th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="group hover:bg-white/5 transition-colors">
                      <td className="whitespace-nowrap px-8 py-5 text-sm font-mono font-medium text-white group-hover:text-plex-yellow transition-colors">
                        {payment.payment_code}
                      </td>
                      <td className="whitespace-nowrap px-8 py-5 text-sm font-bold text-gray-200">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="whitespace-nowrap px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
                          payment.status === 'succeeded' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                        )}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-8 py-5 text-sm text-gray-500">
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
