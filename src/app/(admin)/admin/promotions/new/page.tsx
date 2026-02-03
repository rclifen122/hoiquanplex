'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const promotionSchema = z.object({
    code: z.string().min(3, 'Code must be at least 3 characters').regex(/^[A-Z0-9_-]+$/, 'Uppercase letters, numbers, _, - only'),
    description: z.string().optional(),
    discount_type: z.enum(['percent', 'fixed_amount']),
    discount_value: z.number().positive('Value must be positive'),
    max_uses: z.number().positive().optional().nullable(), // Allow null/empty for unlimited
    expires_at: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof promotionSchema>;

export default function NewPromotionPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            discount_type: 'percent',
            is_active: true,
        },
    });

    const discountType = watch('discount_type');

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        // Filter out empty strings for optional fields to send null
        const payload = {
            ...data,
            max_uses: data.max_uses ? Number(data.max_uses) : null,
            expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null
        };

        try {
            const res = await fetch('/api/admin/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to create promotion');
            }

            router.push('/admin/promotions');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminDashboardLayout>
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="mb-8">
                    <Link
                        href="/admin/promotions"
                        className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Promotions
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Promotion</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Promotion Code
                        </label>
                        <input
                            type="text"
                            {...register('code')}
                            onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                register('code').onChange(e);
                            }}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. SUMMER2024"
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Only uppercase letters, numbers, underscores, and hyphens.</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description (Optional)
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Discount Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Discount Type
                            </label>
                            <select
                                {...register('discount_type')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="percent">Percentage (%)</option>
                                <option value="fixed_amount">Fixed Amount (VND)</option>
                            </select>
                        </div>

                        {/* Discount Value */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Value
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    {...register('discount_value', { valueAsNumber: true })}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-gray-500 sm:text-sm">
                                        {discountType === 'percent' ? '%' : 'VND'}
                                    </span>
                                </div>
                            </div>
                            {errors.discount_value && (
                                <p className="mt-1 text-sm text-red-600">{errors.discount_value.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Max Uses */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Max Uses
                            </label>
                            <input
                                type="number"
                                {...register('max_uses', { valueAsNumber: true })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Leave empty for unlimited"
                            />
                            <p className="mt-1 text-xs text-gray-500">Total times this code can be redeemed globally.</p>
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Expiration Date
                            </label>
                            <input
                                type="datetime-local"
                                {...register('expires_at')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('is_active')}
                            id="is_active"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                            Active immediately
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Promotion
                        </button>
                    </div>
                </form>
            </div>
        </AdminDashboardLayout>
    );
}
