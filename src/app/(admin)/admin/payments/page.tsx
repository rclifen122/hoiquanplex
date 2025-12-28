import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import Link from 'next/link';

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  // Fetch pending payments
  const { data: pendingPayments } = await supabase
    .from('payments')
    .select(`
      *,
      customer:customers(id, full_name, email, phone)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and verify customer payments
        </p>
      </div>

      {/* Pending Payments */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Payments ({pendingPayments?.length || 0})
          </h2>
        </div>

        <div className="p-6">
          {!pendingPayments || pendingPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending payments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {payment.payment_code}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(payment.created_at)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Customer</p>
                          <p className="font-medium text-gray-900">
                            {payment.customer?.full_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.customer?.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Verify →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
