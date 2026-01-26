import { Tv, Film, Monitor, Star } from 'lucide-react';

export function FeaturesSection() {
    return (
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
    );
}
