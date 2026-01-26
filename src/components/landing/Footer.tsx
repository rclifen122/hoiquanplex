import Link from 'next/link';

export function Footer() {
    return (
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
                            <li><Link href="/customer/register" className="text-gray-500 hover:text-plex-yellow text-sm transition-colors lowercase">Đăng ký mới</Link></li>
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
    );
}

export function PartnersSection() {
    return (
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
    );
}
