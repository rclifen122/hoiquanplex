'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithCredentials } from '@/lib/auth/actions';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
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

      if (!result.success) {
        setError(result.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-900/50 border border-red-500/50 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-bold text-white/80 uppercase tracking-wider"
            >
              Email address
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              className="input-cinematic w-full"
              placeholder="admin@hoiquanplex.site"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-bold text-white/80 uppercase tracking-wider"
            >
              Password
            </label>
            <input
              {...register('password')}
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              className="input-cinematic w-full"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-plex-yellow px-6 py-4 text-base font-bold text-black uppercase tracking-widest shadow-lg shadow-plex-yellow/20 hover:bg-plex-yellow/90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-plex-yellow focus:ring-offset-2 focus:ring-offset-black disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="text-center pt-2">
          <a
            href="/"
            className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            ← Back to website
          </a>
        </div>
      </form>
    </div>
  );
}

