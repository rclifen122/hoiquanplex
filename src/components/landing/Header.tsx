import Link from 'next/link';

export function Header() {
    return (
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
                            href="/customer/register"
                            className="rounded-md bg-plex-yellow px-5 py-2 text-sm font-bold text-black shadow-lg shadow-plex-yellow/20 hover:bg-plex-yellow/90 hover:scale-105 transition-all"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
