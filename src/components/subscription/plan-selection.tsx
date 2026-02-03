'use client';

import { useState } from 'react';
import { Check, Loader2, Sparkles, Zap, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface Plan {
    id: string;
    name: string;
    slug: string;
    price: number;
    period: string;
    features: string[];
    tier: string;
    highlighted?: boolean;
    durationTitle?: string;
}

interface PlanSelectionProps {
    plans: Plan[];
    activeSubscription?: {
        plan_id: string;
        plan: {
            price: number;
        };
    } | null;
}

export function PlanSelection({ plans, activeSubscription }: PlanSelectionProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');

    const handleAction = async (plan: Plan) => {
        if (loadingId) return;
        setLoadingId(plan.id);

        try {
            // Check for Downgrade
            if (activeSubscription && plan.price < activeSubscription.plan.price) {
                if (!confirm('Gói bạn chọn thấp hơn gói hiện tại. Bạn có muốn gửi yêu cầu hạ cấp không? Quản trị viên sẽ xem xét và hoàn tiền thừa (nếu có) thủ công.')) {
                    setLoadingId(null);
                    return;
                }

                const res = await fetch('/api/subscriptions/downgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPlanId: plan.id })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Yêu cầu thất bại');

                alert('Đã gửi yêu cầu hạ cấp thành công. Vui lòng đợi Admin duyệt.');
                setLoadingId(null);
                return;
            }

            // Upgrade or New Subscription
            const response = await fetch('/api/payments/manual-create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    planName: plan.name,
                    amount: plan.price,
                    interval: 'month',
                    couponCode: couponCode // Pass coupon
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Khởi tạo thanh toán thất bại');
            }

            if (data.paymentId) {
                router.push(`/customer/payment/${data.paymentId}`);
            } else {
                throw new Error('Không nhận được mã thanh toán');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra');
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Global Coupon Input - Optional Design Choice, simpler than repeating per card */}
            <div className="max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-400 mb-1 text-center">Bạn có mã giảm giá?</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã CODE..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-plex-yellow/50 transition-colors uppercase"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {plans.map((plan) => {
                    const isCurrent = activeSubscription?.plan_id === plan.id;
                    const isDowngrade = activeSubscription && plan.price < activeSubscription.plan.price;
                    const loading = loadingId === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                "relative flex flex-col rounded-2xl p-8 transition-all duration-300",
                                plan.highlighted
                                    ? "glass-card border-plex-yellow/30 ring-1 ring-plex-yellow/50 shadow-[0_0_40px_-10px_rgba(229,160,13,0.3)] scale-105"
                                    : "glass-card hover:bg-white/10"
                            )}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-plex-yellow to-yellow-600 px-4 py-1 text-sm font-bold text-black shadow-lg shadow-plex-yellow/20 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Phổ biến nhất
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={cn("text-2xl font-black uppercase tracking-tight", plan.highlighted ? "text-plex-yellow" : "text-white")}>
                                    {plan.name}
                                </h3>
                                {plan.durationTitle && (
                                    <p className={cn("text-lg font-bold mt-1", plan.highlighted ? "text-plex-yellow/80" : "text-gray-400")}>
                                        {plan.durationTitle}
                                    </p>
                                )}
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold tracking-tight text-white">
                                        {formatCurrency(plan.price)}
                                    </span>
                                    {plan.period && (
                                        <span className="ml-1 text-sm font-semibold text-gray-400">
                                            /{plan.period}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="mb-8 space-y-4 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start">
                                        <div className={cn(
                                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                            plan.highlighted ? "bg-plex-yellow/20 text-plex-yellow" : "bg-white/10 text-gray-300"
                                        )}>
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <span className="ml-3 text-sm text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleAction(plan)}
                                disabled={isCurrent || loading || !!loadingId}
                                className={cn(
                                    "mt-8 block w-full rounded-lg px-6 py-4 text-center text-sm font-bold shadow-lg transition-all duration-200",
                                    isCurrent
                                        ? "cursor-default border border-white/10 bg-white/5 text-gray-400"
                                        : isDowngrade
                                            ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                            : plan.highlighted
                                                ? "bg-gradient-to-r from-plex-yellow to-yellow-600 text-black hover:shadow-plex-yellow/25 hover:scale-[1.02]"
                                                : "bg-white text-black hover:bg-gray-100 hover:scale-[1.02]",
                                    loading ? "opacity-70 cursor-not-allowed" : ""
                                )}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </span>
                                ) : isCurrent ? (
                                    'Gói hiện tại'
                                ) : isDowngrade ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <ArrowDown className="h-4 w-4" />
                                        Yêu cầu Hạ cấp
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        {plan.highlighted && <Zap className="h-4 w-4 fill-current" />}
                                        Nâng cấp ngay
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
