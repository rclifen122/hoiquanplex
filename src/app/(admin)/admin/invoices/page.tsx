import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createAdminClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Download, Send, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default async function InvoicesPage() {
    const supabase = await createAdminClient();

    // Invoices are essentially completed payments in our current schema
    const { data: invoices } = await supabase
        .from('payments')
        .select('*, customer:customers(full_name, email)')
        .eq('status', 'succeeded') // Only successful payments generate invoices
        .order('created_at', { ascending: false });

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white">Invoices</h1>
                        <p className="text-gray-400">View and manage customer billing documents.</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search invoice #"
                                className="pl-9 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-gray-900/50 backdrop-blur-xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Invoice ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {invoices?.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-gray-300">
                                            INV-{invoice.id.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{invoice.customer?.full_name}</div>
                                            <div className="text-xs text-gray-500">{invoice.customer?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {formatDateTime(invoice.created_at)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            {formatCurrency(invoice.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10">
                                                    <Download className="h-4 w-4 text-gray-400" />
                                                </Button>
                                                <Button size="sm" className="h-8 w-8 p-0 bg-plex-yellow text-black hover:bg-amber-400">
                                                    <Send className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!invoices || invoices.length === 0) && (
                            <div className="p-8 text-center text-gray-500">No invoices found.</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminDashboardLayout>
    );
}
