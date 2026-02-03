import Link from 'next/link';
import { Check } from 'lucide-react';

interface Plan {
    name: string;
    durationTitle: string; // New field
    price: string;
    period?: string;
    description: string;
    features: string[];
    cta: string;
    href: string;
    highlighted: boolean;
}

const plans: Plan[] = [
    {
        name: 'Plus',
        durationTitle: '3 Tháng',
        price: '180.000₫',
        period: '/3 tháng',
        description: 'Tiết kiệm thời gian gia hạn',
        features: [
            'Tất cả nội dung Premium',
            'Chất lượng 4K HDR',
            'Không quảng cáo',
            'Xem trên mọi thiết bị',
        ],
        cta: 'Chọn gói Plus',
        href: '/customer/login?redirect=/customer/subscription',
        highlighted: false,
    },
    {
        name: 'Pro',
        durationTitle: '6 Tháng',
        price: '330.000₫',
        period: '/6 tháng',
        description: 'Tiết kiệm 30.000đ',
        features: [
            'Tất cả nội dung Premium',
            'Chất lượng 4K HDR',
            'Không quảng cáo',
            'Xem trên mọi thiết bị',
            'Ưu tiên hỗ trợ',
        ],
        cta: 'Chọn gói Pro',
        href: '/customer/login?redirect=/customer/subscription',
        highlighted: false,
    },
    {
        name: 'Max',
        durationTitle: '12 Tháng',
        price: '600.000₫',
        period: '/năm',
        description: 'Tiết kiệm 120.000đ (Best Deal)',
        features: [
            'Tất cả nội dung Premium',
            'Chất lượng 4K HDR',
            'Không quảng cáo',
            'Xem trên mọi thiết bị',
            'Hỗ trợ VIP 24/7',
        ],
        cta: 'Chọn gói Max',
        href: '/customer/login?redirect=/customer/subscription',
        highlighted: true,
    },
];


export function PricingSection() {
    return (
        <section id="plans" className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold sm:text-4xl text-white">Chọn gói phù hợp với bạn</h2>
                    <p className="mt-4 text-gray-400">Đăng ký dễ dàng, hủy gói bất cứ lúc nào bạn muốn.</p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">

                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-8 rounded-3xl transition-all hover:scale-[1.02] ${plan.highlighted
                                ? 'bg-plex-yellow text-black shadow-2xl shadow-plex-yellow/20 ring-1 ring-plex-yellow'
                                : 'bg-plex-card border border-white/10 text-white'
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-black/10">
                                    Khuyên dùng
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-2xl font-black uppercase tracking-tight">{plan.name}</h3>
                                <p className={`text-lg font-bold ${plan.highlighted ? 'text-black/70' : 'text-gray-400'}`}>{plan.durationTitle}</p>
                                <p className={`mt-2 text-sm ${plan.highlighted ? 'text-black/60' : 'text-gray-500'}`}>{plan.description}</p>
                            </div>

                            <div className="mb-8 overflow-hidden">
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                                    {plan.period && <span className={`ml-1 text-sm font-bold ${plan.highlighted ? 'text-black/60' : 'text-gray-400'}`}>{plan.period}</span>}
                                </div>
                            </div>

                            <ul className="mb-8 space-y-4 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <Check className={`h-5 w-5 shrink-0 ${plan.highlighted ? 'text-black' : 'text-plex-yellow'}`} />
                                        <span className={`text-sm font-medium ${plan.highlighted ? 'text-black/80' : 'text-gray-300'}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`block w-full py-4 px-6 rounded-xl text-center text-sm font-black uppercase tracking-widest transition-all ${plan.highlighted
                                    ? 'bg-black text-white hover:bg-gray-900'
                                    : 'bg-plex-yellow text-black hover:bg-plex-yellow/90'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
