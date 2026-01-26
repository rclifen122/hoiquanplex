import Link from 'next/link';

export function CTASection() {
    return (
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
                            href="/customer/register"
                            className="px-10 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                        >
                            Đăng ký miễn phí
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
