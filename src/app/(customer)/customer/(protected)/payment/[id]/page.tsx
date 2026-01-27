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
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="mb-10 flex flex-col items-center text-center">
                    <span className="inline-flex items-center rounded-full bg-plex-yellow/10 px-3 py-1 text-xs font-bold text-plex-yellow mb-4 ring-1 ring-plex-yellow/20">
                        Step 2 of 2: Payment
                    </span>
                    <h1 className="text-4xl font-black text-white glow-text tracking-tight mb-3">
                        Complete Your Order
                    </h1>
                    <p className="text-gray-400 text-lg max-w-lg">
                        You're almost there! Use the QR code below to finalize your upgrade securely.
                    </p>
                </div>

                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/customer/subscription"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors group"
                    >
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        Back to Plans
                    </Link>
                </div>

                {/* Main Payment Compo */}
                <BankTransferDetails
                    paymentCode={payment.payment_code}
                    amount={payment.amount}
                    bankDetails={bankDetails}
                />

            </div>
        </CustomerDashboardLayout>
    );
}
