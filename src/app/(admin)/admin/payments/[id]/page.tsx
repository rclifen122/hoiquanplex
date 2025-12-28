import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { PaymentVerificationForm } from '@/components/payment/payment-verification-form';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { redirect } from 'next/navigation';

export default async function PaymentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from('payments')
    .select(`
      *,
      customer:customers(id, full_name, email, phone, facebook_profile)
    `)
    .eq('id', params.id)
    .single();

  if (error || !payment) {
    redirect('/admin/payments');
  }

  return (
    <AdminDashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Payment Verification
        </h1>

        <div className="space-y-6">
          {/* Payment Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Information
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Payment Code</dt>
                <dd className="mt-1 text-lg font-bold text-blue-600">
                  {payment.payment_code}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Amount</dt>
                <dd className="mt-1 text-lg font-bold text-gray-900">
                  {formatCurrency(payment.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {payment.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {formatDateTime(payment.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Full Name</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {payment.customer?.full_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {payment.customer?.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {payment.customer?.phone || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Facebook</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {payment.customer?.facebook_profile ? (
                    <a
                      href={payment.customer.facebook_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    'N/A'
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Verification Form */}
          {payment.status === 'pending' && (
            <PaymentVerificationForm paymentId={payment.id} />
          )}

          {payment.status === 'succeeded' && (
            <div className="rounded-xl bg-green-50 p-6">
              <h3 className="font-semibold text-green-900">Payment Approved</h3>
              <p className="mt-1 text-sm text-green-700">
                Verified at: {formatDateTime(payment.verified_at!)}
              </p>
              {payment.bank_transaction_ref && (
                <p className="mt-1 text-sm text-green-700">
                  Bank Ref: {payment.bank_transaction_ref}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
