import Link from 'next/link';
import { Check } from 'lucide-react';

interface Plan {
    name: string;
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
        name: 'Free',
        price: '0đ',
        description: 'Dùng thử miễn phí',
        features: [
            'Truy cập cơ bản',
            'Xem nội dung miễn phí',
            'Hỗ trợ qua email',
        ],
        cta: 'Đăng ký miễn phí',
        href: '/customer/register',
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '199.000₫',
        period: '/tháng',
        description: 'Cho người yêu thích phim ảnh',
        features: [
            'Tất cả nội dung',
            'Chất lượng 4K HDR',
            'Không quảng cáo',
            'Xem trên 2 thiết bị',
            'Tải về xem offline',
        ],
        href: '/customer/login?redirect=/customer/subscription',
        cta: 'Chọn gói Pro',
        highlighted: true,
    },
    {
        name: 'Plus',
        price: '299.000₫',
        period: '/tháng',
        description: 'Trải nghiệm đỉnh cao cho gia đình',
        features: [
            'Tất cả tính năng Pro',
            'Xem trên 4 thiết bị',
            'Hỗ trợ Dolby Atmos',
            'Chia sẻ tài khoản (4 profile)',
            'Ưu tiên hỗ trợ 24/7',
        ],
        href: '/customer/login?redirect=/customer/subscription',
        cta: 'Chọn gói Plus',
        highlighted: false,
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

                <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
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
                                <p className={`mt-2 text-sm ${plan.highlighted ? 'text-black/70' : 'text-gray-400'}`}>{plan.description}</p>
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
