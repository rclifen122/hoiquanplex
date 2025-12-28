import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BankTransferDetails } from '@/components/payment/bank-transfer-details';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import Link from 'next/link';

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Fetch payment details
  const { data: payment, error } = await supabase
    .from('payments')
    .select(`
      *,
      customer:customers(id, full_name, email)
    `)
    .eq('id', params.id)
    .single();

  if (error || !payment) {
    redirect('/');
  }

  // Check if already paid or cancelled
  if (payment.status === 'succeeded') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Đơn hàng của bạn đã được xác nhận.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Check if expired
  const expiresAt = payment.expires_at ? new Date(payment.expires_at) : null;
  const isExpired = expiresAt && new Date() > expiresAt;

  if (isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán đã hết hạn
          </h1>
          <p className="text-gray-600 mb-6">
            Vui lòng tạo đơn hàng mới.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Get bank details from environment variables
  const bankDetails = {
    bankName: process.env.BANK_NAME || 'Vietcombank',
    bankCode: process.env.BANK_CODE || 'VCB',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
    accountName: process.env.BANK_ACCOUNT_NAME || 'HOIQUANPLEX',
    branch: process.env.BANK_BRANCH,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Thông tin thanh toán
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Vui lòng chuyển khoản theo hướng dẫn bên dưới
          </p>
        </div>

        {/* Payment Info Card */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-sm text-gray-600">Khách hàng</p>
              <p className="font-semibold text-gray-900">
                {payment.customer?.full_name || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>

          {expiresAt && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-center">
              <p className="text-sm font-medium text-amber-900">
                ⏰ Hết hạn: {formatDateTime(expiresAt)}
              </p>
            </div>
          )}
        </div>

        {/* Bank Transfer Details */}
        <BankTransferDetails
          paymentCode={payment.payment_code!}
          amount={payment.amount}
          bankDetails={bankDetails}
        />

        {/* Continue Button */}
        <div className="mt-8 text-center">
          <Link
            href={`/payment/${params.id}/waiting`}
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Tôi đã chuyển khoản →
          </Link>
          <p className="mt-3 text-sm text-gray-600">
            Nhấn nút này sau khi hoàn tất chuyển khoản
          </p>
        </div>
      </div>
    </div>
  );
}
