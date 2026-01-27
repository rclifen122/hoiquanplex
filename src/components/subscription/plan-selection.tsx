'use client';

import { useState } from 'react';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, it was used in sidebar

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

    const handleUpgrade = async (plan: Plan) => {
        if (loadingId) return;
        setLoadingId(plan.id);

        try {
            const response = await fetch('/api/payments/stripe-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    planName: plan.name,
                    amount: plan.price,
                    interval: 'month', // defaulted to month as per previous implementation logic
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Khởi tạo thanh toán thất bại');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Không nhận được đường dẫn thanh toán từ Stripe');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra');
            setLoadingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => {
                const isCurrent = plan.id === currentPlanId;
                const loading = loadingId === plan.id;
                const isPro = plan.slug.includes('pro') || plan.tier === 'pro';

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
                            <h3 className={cn("text-xl font-bold", plan.highlighted ? "text-plex-yellow" : "text-white")}>
                                {plan.name}
                            </h3>
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
                            onClick={() => handleUpgrade(plan)}
                            disabled={isCurrent || loading || !!loadingId}
                            className={cn(
                                "mt-8 block w-full rounded-lg px-6 py-4 text-center text-sm font-bold shadow-lg transition-all duration-200",
                                isCurrent
                                    ? "cursor-default border border-white/10 bg-white/5 text-gray-400"
                                    : plan.highlighted
                                        ? "bg-gradient-to-r from-plex-yellow to-yellow-600 text-black hover:shadow-plex-yellow/25 hover:scale-[1.02]"
                                        : "bg-white text-black hover:bg-gray-100 hover:scale-[1.02]",
                                loading ? "opacity-70 cursor-not-allowed" : ""
                            )}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang chuyển hướng...
                                </span>
                            ) : isCurrent ? (
                                'Gói hiện tại'
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
    );
}
