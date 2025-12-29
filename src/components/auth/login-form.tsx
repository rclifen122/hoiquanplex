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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 glass-card p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-plex-yellow">Admin Portal</h2>
          <p className="text-white/50 text-sm mt-2">Dành cho quản trị viên</p>
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

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-white/80 uppercase tracking-wider mb-2"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-plex-yellow px-4 py-3 text-sm font-bold text-black uppercase tracking-widest shadow-lg shadow-plex-yellow/20 hover:bg-plex-yellow/90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-plex-yellow focus:ring-offset-2 focus:ring-offset-black disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="text-center">
          <a
            href="/"
            className="text-sm text-white/60 hover:text-plex-yellow hover:underline transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </form>
    </div>
  );
}
