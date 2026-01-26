'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
                // Show detailed error if available
                const errorMessage = errorData.error || 'Đăng ký thất bại';
                const errorDetails = errorData.details ? `\nChi tiết: ${errorData.details}` : '';
                throw new Error(errorMessage + errorDetails);
            }

            // Redirect to login page with success message
            router.push('/customer/login?registered=true');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-widest text-plex-yellow">Đăng Ký Tài Khoản</h2>
                    <p className="text-white/50 text-sm mt-2">Bắt đầu trải nghiệm giải trí đỉnh cao</p>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-900/50 border border-red-500/50 p-4 text-sm text-red-200 whitespace-pre-wrap">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="full_name" className="block text-sm font-bold text-white/80 uppercase tracking-wider">
                            Họ và tên <span className="text-plex-yellow">*</span>
                        </label>
                        <Input
                            {...register('full_name')}
                            type="text"
                            className="input-cinematic w-full"
                            placeholder="Nguyễn Văn A"
                            disabled={isLoading}
                        />
                        {errors.full_name && (
                            <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-bold text-white/80 uppercase tracking-wider">
                            Email <span className="text-plex-yellow">*</span>
                        </label>
                        <Input
                            {...register('email')}
                            type="email"
                            className="input-cinematic w-full"
                            placeholder="email@example.com"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-bold text-white/80 uppercase tracking-wider">
                            Mật khẩu <span className="text-plex-yellow">*</span>
                        </label>
                        <div className="relative mt-1">
                            <Input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                className="input-cinematic w-full pr-12"
                                placeholder="Tối thiểu 8 ký tự"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirm_password" className="block text-sm font-bold text-white/80 uppercase tracking-wider">
                            Xác nhận mật khẩu <span className="text-plex-yellow">*</span>
                        </label>
                        <div className="relative mt-1">
                            <Input
                                {...register('confirm_password')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="input-cinematic w-full pr-12"
                                placeholder="Nhập lại mật khẩu"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirm_password && (
                            <p className="mt-1 text-sm text-red-400">{errors.confirm_password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-bold text-white/80 uppercase tracking-wider">
                            Số điện thoại
                        </label>
                        <Input
                            {...register('phone')}
                            type="tel"
                            className="input-cinematic w-full"
                            placeholder="0912345678"
                            disabled={isLoading}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="facebook_profile" className="block text-sm font-bold text-white/80 uppercase tracking-wider">
                            Link Facebook (không bắt buộc)
                        </label>
                        <Input
                            {...register('facebook_profile')}
                            type="url"
                            className="input-cinematic w-full"
                            placeholder="https://facebook.com/yourprofile"
                            disabled={isLoading}
                        />
                        {errors.facebook_profile && (
                            <p className="mt-1 text-sm text-red-400">{errors.facebook_profile.message}</p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    variant="cinematic"
                    className="w-full mt-8 py-6 text-base tracking-widest"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : 'Đăng ký tài khoản'}
                </Button>

                <p className="text-center text-xs text-white/40 mt-4">
                    Bằng việc đăng ký, bạn đồng ý với các điều khoản sử dụng của chúng tôi.
                </p>
            </form>
        </div>
    );
}
