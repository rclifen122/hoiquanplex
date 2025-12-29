'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithCredentials } from '@/lib/auth/actions';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithCredentials(data.email, data.password);

      if (result.success) {
        const redirectPath = searchParams.get('redirect');
        router.push(redirectPath || '/customer');
        router.refresh();
      } else {
        setError(result.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 glass-card p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-plex-yellow">Customer Login</h2>
          <p className="text-white/50 text-sm mt-2">Chào mừng bạn quay trở lại</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/50 border border-red-500/50 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-bold text-white/80 uppercase tracking-wider mb-2"
          >
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className="input-cinematic w-full"
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email?.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-white/80 uppercase tracking-wider mb-2"
          >
            Mật khẩu
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            autoComplete="current-password"
            className="input-cinematic w-full"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password?.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-600 bg-white/10 text-plex-yellow focus:ring-plex-yellow focus:ring-offset-black"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-plex-yellow hover:text-plex-yellow/80 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-plex-yellow px-4 py-3 text-sm font-bold text-black uppercase tracking-widest shadow-lg shadow-plex-yellow/20 hover:bg-plex-yellow/90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-plex-yellow focus:ring-offset-2 focus:ring-offset-black disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
              Đang đăng nhập...
            </span>
          ) : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
