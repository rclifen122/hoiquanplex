import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';


export function HeroSection() {
    return (
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] opacity-20 blur-3xl bg-gradient-to-l from-plex-yellow to-transparent rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 text-center lg:text-left animate-fade-in-up">
                        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
                            Trải nghiệm <br />
                            <span className="text-plex-yellow">Giải trí vô tận</span>
                        </h1>
                        <p className="mt-8 text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
                            Khám phá hàng ngàn bộ phim, chương trình truyền hình và nội dung độc quyền với chất lượng 4K cực đỉnh. Đăng ký ngay để bắt đầu hành trình của bạn.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                            <Link
                                href="/customer/register"
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
                            <div className="absolute inset-0 bg-plex-yellow/10 group-hover:bg-plex-yellow/0 transition-colors z-10" />
                            <Image
                                src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=1000"
                                alt="Entertainment"
                                fill
                                className="object-cover opacity-60 mix-blend-overlay"
                            />


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
    );
}
