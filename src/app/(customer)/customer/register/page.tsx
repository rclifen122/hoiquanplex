import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { redirect } from 'next/navigation';
import { CustomerRegisterForm } from '@/components/auth/customer-register-form';

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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">HoiQuanPlex</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Tạo tài khoản mới
                    </p>
                </div>

                <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
                    <CustomerRegisterForm />
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <a
                            href="/customer/login"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Đăng nhập ngay
                        </a>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <a
                        href="/"
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Quay lại trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
}
