import Image from 'next/image';
import { Zap, Shield } from 'lucide-react';


export function AboutSection() {
    return (
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
                            <div className="aspect-[3/4] rounded-2xl bg-plex-card border border-white/5 overflow-hidden relative">
                                <Image
                                    src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400"
                                    className="object-cover"
                                    alt="movie"
                                    fill
                                />
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
                            <div className="aspect-[3/4] rounded-2xl bg-plex-card border border-white/5 overflow-hidden relative">
                                <Image
                                    src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400"
                                    className="object-cover"
                                    alt="cinema"
                                    fill
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
