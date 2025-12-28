'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  full_name: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  facebook_profile: z.string().url('Link Facebook không hợp lệ').optional().or(z.literal('')),
  plan_id: z.string().min(1, 'Vui lòng chọn gói dịch vụ'),
});

type FormData = z.infer<typeof formSchema>;

interface RegistrationFormAProps {
  plans: Array<{
    id: string;
    name: string;
    price: number;
    tier: string;
    duration_months: number;
  }>;
}

export function RegistrationFormA({ plans }: RegistrationFormAProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Capture UTM parameters
      const utmData = {
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
      };

      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'form_a',
          form_data: data,
          ...utmData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Đăng ký thất bại');
      }

      const result = await response.json();

      // Redirect to payment page
      router.push(`/payment/${result.payment_id}`);
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
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Số điện thoại <span className="text-red-600">*</span>
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

      <div>
        <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700 mb-3">
          Chọn gói dịch vụ <span className="text-red-600">*</span>
        </label>
        <div className="space-y-3">
          {plans.map((plan) => (
            <label
              key={plan.id}
              className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center">
                <input
                  {...register('plan_id')}
                  type="radio"
                  value={plan.id}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-600">{plan.duration_months} tháng</p>
                </div>
              </div>
              <p className="font-bold text-blue-600">
                {new Intl.NumberFormat('vi-VN').format(plan.price)} ₫
              </p>
            </label>
          ))}
        </div>
        {errors.plan_id && (
          <p className="mt-1 text-sm text-red-600">{errors.plan_id.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay →'}
      </button>

      <p className="text-center text-xs text-gray-600">
        Bằng việc đăng ký, bạn đồng ý với các điều khoản sử dụng của chúng tôi.
      </p>
    </form>
  );
}
