'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
    full_name: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirm_password: z.string(),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
    facebook_profile: z.string().url('Link Facebook không hợp lệ').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirm_password, {
    message: 'Mật khẩu không khớp',
    path: ['confirm_password'],
});

type FormData = z.infer<typeof formSchema>;

export function CustomerRegisterForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/customer/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: data.full_name,
                    email: data.email,
                    password: data.password,
                    phone: data.phone,
                    facebook_profile: data.facebook_profile,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Đăng ký thất bại');
            }

            // Redirect to login page with success message
            router.push('/customer/login?registered=true');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-600">*</span>
                </label>
                <input
                    {...register('full_name')}
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nguyễn Văn A"
                    disabled={isLoading}
                />
                {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-600">*</span>
                </label>
                <input
                    {...register('email')}
                    type="email"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                    disabled={isLoading}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu <span className="text-red-600">*</span>
                </label>
                <div className="relative mt-1">
                    <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tối thiểu 8 ký tự"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu <span className="text-red-600">*</span>
                </label>
                <div className="relative mt-1">
                    <input
                        {...register('confirm_password')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập lại mật khẩu"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                </label>
                <input
                    {...register('phone')}
                    type="tel"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0912345678"
                    disabled={isLoading}
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="facebook_profile" className="block text-sm font-medium text-gray-700">
                    Link Facebook (không bắt buộc)
                </label>
                <input
                    {...register('facebook_profile')}
                    type="url"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://facebook.com/yourprofile"
                    disabled={isLoading}
                />
                {errors.facebook_profile && (
                    <p className="mt-1 text-sm text-red-600">{errors.facebook_profile.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
            >
                {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
            </button>

            <p className="text-center text-xs text-gray-600">
                Bằng việc đăng ký, bạn đồng ý với các điều khoản sử dụng của chúng tôi.
            </p>
        </form>
    );
}
