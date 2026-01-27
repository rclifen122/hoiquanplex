'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const verifySchema = z.object({
  bank_transaction_ref: z.string().optional(),
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().optional(),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface PaymentVerificationFormProps {
  paymentId: string;
}

export function PaymentVerificationForm({ paymentId }: PaymentVerificationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectReason, setShowRejectReason] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verification failed. Status:', response.status, 'Body:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Verification failed with status: ${response.status}`);
        } catch (_e) {
          console.warn('Parse error:', _e);
          throw new Error(`Verification failed: ${errorText || response.statusText}`);
        }
      }

      console.log('Verification successful. Redirecting...');
      router.push('/admin/payments');
      router.refresh();
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Verify Payment
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="bank_transaction_ref" className="block text-sm font-medium text-gray-700">
            Bank Transaction Reference
          </label>
          <input
            {...register('bank_transaction_ref')}
            type="text"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter bank transaction ID (Optional)"
          />
          {errors.bank_transaction_ref && (
            <p className="mt-1 text-sm text-red-600">{errors.bank_transaction_ref.message}</p>
          )}
        </div>

        {showRejectReason && (
          <div>
            <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700">
              Rejection Reason
            </label>
            <textarea
              {...register('rejection_reason')}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Why is this payment being rejected?"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            onClick={() => {
              setValue('action', 'approve');
              setShowRejectReason(false);
            }}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Approve Payment'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowRejectReason(!showRejectReason);
              setValue('action', 'reject');
            }}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:bg-gray-400"
          >
            {showRejectReason ? 'Cancel Reject' : 'Reject Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}
