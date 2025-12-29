import Link from 'next/link';
import { Check, Play, Tv, Film, Monitor, Shield, Zap, Star } from 'lucide-react';

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
    <div className="min-h-screen bg-plex-dark text-white selection:bg-plex-yellow selection:text-black">
      {/* Sticky Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tighter text-plex-yellow">HOI QUAN PLEX</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Tính năng</Link>
                <Link href="#about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Về chúng tôi</Link>
                <Link href="#plans" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Gói cước</Link>
                <Link href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Liên hệ</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/customer/login"
                className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register/form-a"
                className="rounded-md bg-plex-yellow px-5 py-2 text-sm font-bold text-black shadow-lg shadow-plex-yellow/20 hover:bg-plex-yellow/90 hover:scale-105 transition-all"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
          {/* Abstract Background Element */}
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] opacity-20 blur-3xl bg-gradient-to-l from-plex-yellow to-transparent rounded-full translate-x-1/2 -translate-y-1/2" />

          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
                  Trải nghiệm <br />
                  <span className="text-plex-yellow">Giải trí vô tận</span>
                </h1>
                <p className="mt-8 text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
                  Khám phá hàng ngàn bộ phim, chương trình truyền hình và nội dung độc quyền với chất lượng 4K cực đỉnh. Đăng ký ngay để bắt đầu hành trình của bạn.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/register/form-a"
                    className="rounded-md bg-plex-yellow px-8 py-4 text-lg font-bold text-black shadow-xl shadow-plex-yellow/20 hover:bg-plex-yellow/90 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    Bắt đầu xem <Play className="fill-black w-4 h-4" />
                  </Link>
                  <Link
                    href="#plans"
                    className="rounded-md border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-lg font-bold text-white hover:bg-white/10 transition-all"
                  >
                    Xem bảng giá
                  </Link>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="aspect-video lg:aspect-square w-full bg-gradient-to-br from-plex-card to-black rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-plex-yellow/10 group-hover:bg-plex-yellow/0 transition-colors" />
                  <img src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=1000" alt="Entertainment" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                  <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-plex-yellow text-sm font-bold uppercase tracking-widest">Đang thịnh hành</p>
                        <h3 className="text-xl font-bold">Siêu Chiến Binh: Hồi Kết</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-plex-yellow/20 flex items-center justify-center border border-plex-yellow/40">
                        <Play className="text-plex-yellow fill-plex-yellow w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Bar */}
        <section className="bg-white/5 border-y border-white/5 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale contrast-125 hover:grayscale-0 transition-all">
              <span className="text-2xl font-bold">NETFLIX</span>
              <span className="text-2xl font-bold">HBO Max</span>
              <span className="text-2xl font-bold">Disney+</span>
              <span className="text-2xl font-bold">PIXAR</span>
              <span className="text-2xl font-bold">WARNER BROS.</span>
              <span className="text-2xl font-bold">MARVEL</span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="flex-1">
                <span className="text-plex-yellow font-bold uppercase tracking-[0.2em] text-sm">Về Hội Quán Plex</span>
                <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl leading-tight">
                  Tương lai của <br /> <span className="text-plex-yellow">Phim ảnh & Truyền hình</span>
                </h2>
                <p className="mt-6 text-gray-400 text-lg leading-relaxed">
                  Chúng tôi mang đến giải pháp xem phim trực tuyến hàng đầu, kết hợp giữa công nghệ truyền tải hiện đại và kho nội dung bản quyền phong phú. Từ những tác phẩm kinh điển đến những bom tấn mới nhất, tất cả đều trong tầm tay bạn.
                </p>
                <div className="mt-8 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-plex-yellow/20 flex items-center justify-center">
                      <Zap className="text-plex-yellow w-5 h-5" />
                    </div>
                    <p className="font-semibold">Tốc độ tải cực nhanh, không giật lag</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-plex-yellow/20 flex items-center justify-center">
                      <Shield className="text-plex-yellow w-5 h-5" />
                    </div>
                    <p className="font-semibold">Bảo mật thông tin & Thanh toán an toàn</p>
                  </div>
                </div>
                <button className="mt-10 px-8 py-3 rounded-md border border-white/20 hover:border-plex-yellow hover:text-plex-yellow transition-all flex items-center gap-2 font-bold uppercase tracking-widest text-sm">
                  Đọc thêm về chúng tôi
                </button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="aspect-[3/4] rounded-2xl bg-plex-card border border-white/5 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="movie" />
                  </div>
                  <div className="p-6 rounded-2xl bg-plex-yellow text-black">
                    <p className="text-3xl font-black">500+</p>
                    <p className="text-sm font-bold opacity-80 uppercase">Series Độc quyền</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-3xl font-black text-plex-yellow">24/7</p>
                    <p className="text-sm font-bold text-gray-400 uppercase">Hỗ trợ kỹ thuật</p>
                  </div>
                  <div className="aspect-[3/4] rounded-2xl bg-plex-card border border-white/5 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="cinema" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-plex-card/50 py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold sm:text-4xl">Tại sao nên chọn chúng tôi?</h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Tận hưởng dịch vụ cao cấp với những tính năng vượt trội được thiết kế riêng cho người yêu điện ảnh.</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Tv, title: "Kho nội dung khổng lồ", desc: "Hàng ngàn bộ phim, series và chương trình độc quyền được cập nhật mỗi ngày." },
                { icon: Film, title: "Chất lượng 4K HDR", desc: "Trải nghiệm hình ảnh sắc nét, màu sắc sống động như tại rạp chiếu phim." },
                { icon: Monitor, title: "Đa nền tảng", desc: "Xem trên TV, điện thoại, tablet hay máy tính mọi lúc mọi nơi." },
                { icon: Star, title: "Không quảng cáo", desc: "Đắm chìm hoàn toàn vào nội dung mà không bị làm phiền bởi quảng cáo." },
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-3xl bg-black/40 border border-white/5 hover:border-plex-yellow/50 hover:bg-black/60 transition-all group">
                  <div className="h-12 w-12 rounded-2xl bg-plex-yellow/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="text-plex-yellow w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
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

        {/* Final CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative rounded-[40px] bg-plex-yellow p-12 overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-black leading-tight">Sẵn sàng để bắt đầu chưa?</h2>
                  <p className="mt-2 text-black/70 font-bold">Gia nhập cộng đồng xem phim lớn nhất Việt Nam ngay hôm nay.</p>
                </div>
                <Link
                  href="/register/form-a"
                  className="px-10 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                >
                  Đăng ký miễn phí
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="inline-block">
                <span className="text-2xl font-black tracking-tighter text-plex-yellow uppercase">HoiQuanPlex</span>
              </Link>
              <p className="mt-6 text-gray-500 text-sm leading-relaxed">
                Nền tảng giải trí trực tuyến hàng đầu Việt Nam, cung cấp trải nghiệm xem phim chất lượng cao với chi phí hợp lý nhất.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Sản phẩm</h4>
              <ul className="space-y-4">
                <li><Link href="#plans" className="text-gray-500 hover:text-plex-yellow text-sm transition-colors lowercase">Gói dịch vụ</Link></li>
                <li><Link href="/register/form-a" className="text-gray-500 hover:text-plex-yellow text-sm transition-colors lowercase">Đăng ký mới</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Hỗ trợ</h4>
              <ul className="space-y-4">
                <li><Link href="/customer/login" className="text-gray-500 hover:text-plex-yellow text-sm transition-colors lowercase">Tài khoản</Link></li>
                <li><a href="mailto:support@hoiquanplex.site" className="text-gray-500 hover:text-plex-yellow text-sm transition-colors lowercase">Liên hệ hỗ trợ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Quản trị</h4>
              <ul className="space-y-4">
                <li><Link href="/admin/login" className="text-gray-500 hover:text-plex-yellow text-sm transition-colors lowercase">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600 uppercase tracking-widest">
              © 2025 HoiQuanPlex. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="h-5 w-5 rounded-full bg-white/5 cursor-pointer hover:bg-plex-yellow transition-colors" />
              <span className="h-5 w-5 rounded-full bg-white/5 cursor-pointer hover:bg-plex-yellow transition-colors" />
              <span className="h-5 w-5 rounded-full bg-white/5 cursor-pointer hover:bg-plex-yellow transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
