'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { BankTransferDetails } from '@/components/payment/bank-transfer-details';
import { useRouter } from 'next/navigation';

export interface Plan {
    id: string;
    name: string;
    slug: string;
    price: number;
    period: string;
    features: string[];
    tier: string;
    highlighted?: boolean;
}

interface PlanSelectionProps {
    plans: Plan[];
    currentPlanId?: string;
}

export function PlanSelection({ plans, currentPlanId }: PlanSelectionProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<{
        payment_code: string;
        amount: number;
        bank_info: {
            bank_name: string;
            account_number: string;
            account_name: string;
        };
    } | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleUpgrade = async (plan: Plan) => {
        if (loadingId) return;
        setLoadingId(plan.id);

        try {
            const response = await fetch('/api/subscriptions/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: plan.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Nâng cấp thất bại');
            }

            setPaymentData({
                payment_code: data.payment_code,
                amount: data.amount,
                bank_info: data.bank_info,
            });
            setShowPaymentModal(true);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra');
        } finally {
            setLoadingId(null);
        }
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentData(null);
        router.refresh(); // Refresh to potentially show pending status
    };

    return (
        <>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {plans.map((plan) => {
                    const isCurrent = plan.id === currentPlanId;
                    const loading = loadingId === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 transition-all hover:scale-[1.02] ${plan.highlighted
                                ? 'ring-blue-600 shadow-xl'
                                : 'ring-gray-200'
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                                    Phổ biến nhất
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <div className="mt-4 flex items-baseline text-gray-900">
                                    <span className="text-4xl font-bold tracking-tight">
                                        {formatCurrency(plan.price)}
                                    </span>
                                    {plan.period && (
                                        <span className="ml-1 text-sm font-semibold text-gray-600">
                                            {plan.period}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="mb-8 space-y-4 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start">
                                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                                        <span className="ml-3 text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(plan)}
                                disabled={isCurrent || loading || !!loadingId}
                                className={`mt-8 block w-full rounded-lg px-6 py-4 text-center text-sm font-bold shadow-sm transition-all ${isCurrent
                                    ? 'cursor-default bg-gray-100 text-gray-500'
                                    : plan.highlighted
                                        ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg'
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </span>
                                ) : isCurrent ? (
                                    'Gói hiện tại'
                                ) : (
                                    'Nâng cấp ngay'
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && paymentData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                Thanh toán chuyển khoản
                            </h3>
                            <button
                                onClick={closePaymentModal}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <BankTransferDetails
                                paymentCode={paymentData.payment_code}
                                amount={paymentData.amount}
                                bankDetails={{
                                    bankName: paymentData.bank_info.bank_name,
                                    bankCode: 'TCB', // Hardcoded or from ENV if available
                                    accountNumber: paymentData.bank_info.account_number,
                                    accountName: paymentData.bank_info.account_name,
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={closePaymentModal}
                                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={closePaymentModal}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                            >
                                Tôi đã thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
