import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { BankTransferDetails } from '@/components/payment/bank-transfer-details';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PaymentPage({ params }: { params: { id: string } }) {
    const customer = await getCustomer();
    if (!customer) redirect('/customer/login');

    const supabase = await createClient();

    const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('id', params.id)
        .eq('customer_id', customer.id)
        .single();

    if (!payment) {
        notFound();
    }

    // Redirect if already paid
    if (payment.status === 'succeeded') {
        redirect('/customer/services');
    }

    // Bank details from Environment Variables
    const bankDetails = {
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Vietcombank',
        bankCode: process.env.NEXT_PUBLIC_BANK_ID || 'VCB', // BIN/ID for VietQR (e.g., 970422)
        accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUM || '1012406280',
        accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'MAC TUAN ANH',
        branch: 'Hội sở chính'
    };

    return (
        <CustomerDashboardLayout>
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/customer/subscription"
                        className="rounded-full p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white glow-text">Thanh toán đơn hàng</h1>
                        <p className="text-gray-400 text-sm">Vui lòng hoàn tất chuyển khoản để kích hoạt dịch vụ</p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-1">
                    <BankTransferDetails
                        paymentCode={payment.payment_code}
                        amount={payment.amount}
                        bankDetails={bankDetails}
                    />
                </div>
            </div>
        </CustomerDashboardLayout>
    );
}
