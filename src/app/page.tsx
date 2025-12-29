import Link from 'next/link';
import { Check } from 'lucide-react';

export default function HomePage() {
  const plans = [
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
      href: '/register/form-a',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '150,000đ',
      period: '/tháng',
      description: 'Dành cho người dùng cá nhân',
      features: [
        'Truy cập toàn bộ nội dung',
        'Chất lượng Full HD',
        'Xem trên 2 thiết bị',
        'Hỗ trợ ưu tiên',
        'Không quảng cáo',
      ],
      cta: 'Chọn gói Pro',
      href: '/register/form-a',
      highlighted: true,
    },
    {
      name: 'Plus',
      price: '300,000đ',
      period: '/tháng',
      description: 'Dành cho gia đình',
      features: [
        'Tất cả tính năng Pro',
        'Chất lượng 4K Ultra HD',
        'Xem trên 4 thiết bị',
        'Hỗ trợ VIP 24/7',
        'Tải xuống không giới hạn',
        '4 hồ sơ riêng biệt',
      ],
      cta: 'Chọn gói Plus',
      href: '/register/form-a',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">HoiQuanPlex</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/customer/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register/form-a"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Trải nghiệm giải trí
            <span className="block text-blue-600">không giới hạn</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Xem hàng ngàn bộ phim, chương trình truyền hình và nội dung độc quyền với chất lượng cao nhất.
            Hủy bất cứ lúc nào.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register/form-a"
              className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Bắt đầu ngay
            </Link>
            <Link
              href="#plans"
              className="rounded-lg border-2 border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-900 hover:border-gray-400 transition-colors"
            >
              Xem gói dịch vụ
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Tại sao chọn HoiQuanPlex?
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">📺</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Kho nội dung khổng lồ</h3>
              <p className="mt-2 text-sm text-gray-600">
                Hàng ngàn bộ phim, series và chương trình độc quyền
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">🎬</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Chất lượng cao</h3>
              <p className="mt-2 text-sm text-gray-600">
                Xem với chất lượng Full HD và 4K Ultra HD
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Xem mọi nơi</h3>
              <p className="mt-2 text-sm text-gray-600">
                Trên điện thoại, tablet, laptop và TV
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">🚫</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Không quảng cáo</h3>
              <p className="mt-2 text-sm text-gray-600">
                Trải nghiệm xem không bị gián đoạn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Chọn gói phù hợp với bạn</h2>
            <p className="mt-4 text-lg text-gray-600">
              Linh hoạt thay đổi hoặc hủy gói bất cứ lúc nào
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl ${
                  plan.highlighted
                    ? 'border-2 border-blue-600 bg-white shadow-xl ring-2 ring-blue-600'
                    : 'border border-gray-200 bg-white shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <span className="inline-block rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                  <p className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-lg text-gray-600">{plan.period}</span>}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="ml-3 text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`mt-8 block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">HoiQuanPlex</h3>
              <p className="mt-2 text-sm text-gray-600">
                Nền tảng giải trí trực tuyến hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Sản phẩm</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="#plans" className="text-sm text-gray-600 hover:text-gray-900">
                    Gói dịch vụ
                  </Link>
                </li>
                <li>
                  <Link href="/register/form-a" className="text-sm text-gray-600 hover:text-gray-900">
                    Đăng ký
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Hỗ trợ</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/customer/login" className="text-sm text-gray-600 hover:text-gray-900">
                    Tài khoản của tôi
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@hoiquanplex.site" className="text-sm text-gray-600 hover:text-gray-900">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Quản trị</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 HoiQuanPlex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
