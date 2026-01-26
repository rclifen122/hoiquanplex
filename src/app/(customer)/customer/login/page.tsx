import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { redirect } from 'next/navigation';
import { CustomerLoginForm } from '@/components/auth/customer-login-form';
import Link from 'next/link';

export const metadata = {
  title: 'Đăng nhập - HoiQuanPlex',
  description: 'Đăng nhập vào tài khoản khách hàng của bạn',
};

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  // If already logged in as customer, redirect to dashboard
  const customer = await getCustomer();
  if (customer) {
    redirect('/customer');
  }

  const showRegisteredMessage = searchParams.registered === 'true';

  return (
    <div className="flex min-h-screen items-center justify-center bg-cinematic px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-black tracking-tighter text-plex-yellow uppercase drop-shadow-lg">HoiQuanPlex</h1>
          </Link>
          <p className="mt-2 text-sm text-gray-400">
            Chào mừng trở lại. Đăng nhập để tiếp tục.
          </p>
        </div>

        {showRegisteredMessage && (
          <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-green-400">
              ✓ Đăng ký thành công! Vui lòng đăng nhập.
            </p>
          </div>
        )}

        <div className="glass-card rounded-2xl p-8 shadow-2xl ring-1 ring-white/10">
          <CustomerLoginForm />
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link
              href="/customer/register"
              className="font-bold text-plex-yellow hover:text-plex-yellow/80 transition-colors"
            >
              Đăng ký ngay
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
