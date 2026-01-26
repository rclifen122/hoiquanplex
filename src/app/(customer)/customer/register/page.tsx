import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { redirect } from 'next/navigation';
import { CustomerRegisterForm } from '@/components/auth/customer-register-form';
import Link from 'next/link';

export const metadata = {
    title: 'Đăng ký tài khoản - HoiQuanPlex',
    description: 'Tạo tài khoản mới để sử dụng dịch vụ HoiQuanPlex',
};

export default async function CustomerRegisterPage() {
    // If already logged in, redirect to dashboard
    const customer = await getCustomer();
    if (customer) {
        redirect('/customer');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-cinematic px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-4xl font-black tracking-tighter text-plex-yellow uppercase drop-shadow-lg">HoiQuanPlex</h1>
                    </Link>
                    <p className="mt-2 text-sm text-gray-400">
                        Tạo tài khoản & bắt đầu trải nghiệm
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-8 shadow-2xl ring-1 ring-white/10">
                    <CustomerRegisterForm />
                </div>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-sm text-gray-500">
                        Đã có tài khoản?{' '}
                        <Link
                            href="/customer/login"
                            className="font-bold text-plex-yellow hover:text-plex-yellow/80 transition-colors"
                        >
                            Đăng nhập ngay
                        </Link>
                    </p>
                    <Link
                        href="/"
                        className="inline-block text-xs uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                    >
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
