'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { requestEmailChange } from '@/lib/auth/customer-actions';

const emailSchema = z.object({
  new_email: z.string().email('Email không hợp lệ'),
  confirm_email: z.string().email('Email không hợp lệ'),
}).refine((data) => data.new_email === data.confirm_email, {
  message: 'Email xác nhận không khớp',
  path: ['confirm_email'],
});

type EmailFormData = z.infer<typeof emailSchema>;

export function CustomerEmailChangeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await requestEmailChange(data.new_email);

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Email xác nhận đã được gửi đến địa chỉ mới',
        });
        reset();
      } else {
        setMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${message.type === 'success'
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
            }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="new_email" className="block text-sm font-medium text-gray-300">
          Email mới <span className="text-red-500">*</span>
        </label>
        <input
          {...register('new_email')}
          type="email"
          id="new_email"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
          placeholder="newemail@example.com"
        />
        {errors.new_email && (
          <p className="mt-1 text-sm text-red-600">{errors.new_email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm_email" className="block text-sm font-medium text-gray-300">
          Xác nhận email mới <span className="text-red-500">*</span>
        </label>
        <input
          {...register('confirm_email')}
          type="email"
          id="confirm_email"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
          placeholder="newemail@example.com"
        />
        {errors.confirm_email && (
          <p className="mt-1 text-sm text-red-600">{errors.confirm_email.message}</p>
        )}
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-gray-300">
          <span className="font-medium">Lưu ý:</span> Sau khi nhấn gửi, bạn sẽ nhận được email
          xác nhận tại địa chỉ mới. Vui lòng kiểm tra hộp thư và xác nhận email trong vòng 24 giờ.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Đang gửi...' : 'Gửi email xác nhận'}
        </button>
      </div>
    </form>
  );
}
