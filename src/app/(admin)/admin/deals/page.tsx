import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createAdminClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default async function DealsPage() {
    const supabase = await createAdminClient();

    // Fetch deal data (Payments & Subscriptions)
    const { data: payments } = await supabase
        .from('payments')
        .select('*, customer:customers(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, customer:customers(full_name), plan:subscription_plans(name, price)')
        .order('created_at', { ascending: false });

    const recentDeals = payments?.filter(p => p.status === 'succeeded') || [];
    const pendingDeals = payments?.filter(p => p.status === 'pending') || [];

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-white">Deals Pipeline</h1>
                    <p className="text-gray-400">Manage payment transactions and active subscriptions.</p>
                </div>

                <Tabs defaultValue="transactions" className="space-y-6">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="subscriptions">Active Plans</TabsTrigger>
                    </TabsList>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Pending Deals */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-amber-500" />
                                        Pending Deals ({pendingDeals.length})
                                    </CardTitle>
                                    <CardDescription>Awaiting verification</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {pendingDeals.map((deal) => (
                                        <div key={deal.id} className="zoom-in-95 animate-in fade-in flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/5">
                                            <div>
                                                <p className="font-bold text-white mb-1">{deal.customer?.full_name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{deal.payment_code}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-plex-yellow font-bold">{formatCurrency(deal.amount)}</p>
                                                <Link href={`/admin/payments/${deal.id}`} className="text-xs text-blue-400 hover:text-blue-300 mt-1 block">
                                                    Review &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    {pendingDeals.length === 0 && <p className="text-sm text-gray-500 italic">No pending deals.</p>}
                                </CardContent>
                            </Card>

                            {/* Closed Deals */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        Closed Deals (Last 50)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {recentDeals.map((deal) => (
                                        <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{deal.customer?.full_name}</p>
                                                    <p className="text-xs text-gray-500">{formatDateTime(deal.created_at)}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-mono text-gray-300">{formatCurrency(deal.amount)}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Subscriptions Tab */}
                    <TabsContent value="subscriptions">
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Active Subscriptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    {subscriptions?.map((sub) => (
                                        <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${sub.status === 'active' ? 'bg-emerald-500/20' : 'bg-gray-700/50'}`}>
                                                    <AlertCircle className={`w-5 h-5 ${sub.status === 'active' ? 'text-emerald-400' : 'text-gray-400'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{sub.customer?.full_name}</p>
                                                    <p className="text-sm text-gray-400">{sub.plan?.name} Plan</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-white font-medium capitalize">{sub.status}</p>
                                                <p className="text-xs text-gray-500">Ends: {new Date(sub.current_period_end).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminDashboardLayout>
    );
}
