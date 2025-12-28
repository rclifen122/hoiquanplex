'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createSubscription, updateSubscription } from '@/lib/actions/subscription-admin-actions';

const subscriptionCreateSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  plan_id: z.string().min(1, 'Plan is required'),
  start_date: z.string().min(1, 'Start date is required'),
  auto_renew: z.boolean(),
});

const subscriptionEditSchema = z.object({
  end_date: z.string().min(1, 'End date is required'),
  auto_renew: z.boolean(),
  status: z.enum(['active', 'past_due', 'cancelled', 'expired']),
});

type SubscriptionCreateData = z.infer<typeof subscriptionCreateSchema>;
type SubscriptionEditData = z.infer<typeof subscriptionEditSchema>;

interface SubscriptionFormProps {
  mode: 'create' | 'edit';
  customers?: Array<{ id: string; full_name: string; email: string }>;
  plans?: Array<{
    id: string;
    name: string;
    price: number;
    duration_months: number;
    tier: string;
  }>;
  preselectedCustomerId?: string;
  subscription?: {
    id: string;
    customer_id: string;
    plan_id: string;
    start_date: string;
    end_date: string;
    auto_renew: boolean;
    status: string;
  };
}

export function SubscriptionForm({
  mode,
  customers,
  plans,
  preselectedCustomerId,
  subscription,
}: SubscriptionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState(
    mode === 'edit' && subscription ? subscription.plan_id : ''
  );

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

  // Calculate default end date based on selected plan
  const calculateEndDate = (startDate: string, durationMonths: number): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    return end.toISOString().split('T')[0]!;
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionCreateData | SubscriptionEditData>({
    resolver: zodResolver(mode === 'create' ? subscriptionCreateSchema : subscriptionEditSchema),
    defaultValues:
      mode === 'edit' && subscription
        ? {
            end_date: subscription.end_date.split('T')[0],
            auto_renew: subscription.auto_renew,
            status: subscription.status as 'active' | 'past_due' | 'cancelled' | 'expired',
          }
        : {
            customer_id: preselectedCustomerId || '',
            start_date: new Date().toISOString().split('T')[0],
            auto_renew: false,
          },
  });

  const watchStartDate = mode === 'create' ? watch('start_date' as keyof SubscriptionCreateData) : null;
  const watchPlanId = mode === 'create' ? watch('plan_id' as keyof SubscriptionCreateData) : null;

  // Auto-calculate end date when plan or start date changes
  if (mode === 'create' && watchStartDate && watchPlanId && selectedPlan) {
    const endDate = calculateEndDate(watchStartDate as string, selectedPlan.duration_months);
    // Only update if different to avoid infinite loop
    const currentEndDate = (document.getElementById('calculated_end_date') as HTMLInputElement)?.value;
    if (currentEndDate !== endDate) {
      setValue('end_date' as keyof SubscriptionCreateData, endDate as never);
    }
  }

  const onSubmit = async (data: SubscriptionCreateData | SubscriptionEditData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'create') {
        const createData = data as SubscriptionCreateData;
        const endDate: string = selectedPlan
          ? calculateEndDate(createData.start_date, selectedPlan.duration_months)
          : new Date().toISOString().split('T')[0]!;

        const result = await createSubscription({
          customer_id: createData.customer_id,
          plan_id: createData.plan_id,
          start_date: createData.start_date,
          end_date: endDate,
          auto_renew: createData.auto_renew,
        });

        if (result.success) {
          router.push(`/admin/subscriptions/${result.subscriptionId}`);
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to create subscription' });
        }
      } else if (mode === 'edit' && subscription) {
        const editData = data as SubscriptionEditData;
        const result = await updateSubscription(subscription.id, {
          end_date: editData.end_date,
          auto_renew: editData.auto_renew,
          status: editData.status,
        });

        if (result.success) {
          setMessage({ type: 'success', text: 'Subscription updated successfully' });
          router.refresh();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update subscription' });
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {mode === 'create' ? (
        <>
          {/* Create Mode Fields */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                {...register('customer_id' as keyof SubscriptionCreateData)}
                id="customer_id"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={!!preselectedCustomerId}
              >
                <option value="">Select a customer...</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} ({customer.email})
                  </option>
                ))}
              </select>
              {(errors as { customer_id?: { message?: string } }).customer_id && (
                <p className="mt-1 text-sm text-red-600">
                  {(errors as { customer_id?: { message?: string } }).customer_id?.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700">
                Subscription Plan <span className="text-red-500">*</span>
              </label>
              <select
                {...register('plan_id' as keyof SubscriptionCreateData)}
                id="plan_id"
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a plan...</option>
                {plans?.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.duration_months} months - {plan.price.toLocaleString()} VND
                  </option>
                ))}
              </select>
              {(errors as { plan_id?: { message?: string } }).plan_id && (
                <p className="mt-1 text-sm text-red-600">
                  {(errors as { plan_id?: { message?: string } }).plan_id?.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register('start_date' as keyof SubscriptionCreateData)}
                type="date"
                id="start_date"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {(errors as { start_date?: { message?: string } }).start_date && (
                <p className="mt-1 text-sm text-red-600">
                  {(errors as { start_date?: { message?: string } }).start_date?.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="calculated_end_date" className="block text-sm font-medium text-gray-700">
                End Date (Auto-calculated)
              </label>
              <input
                id="calculated_end_date"
                type="date"
                value={
                  selectedPlan && watchStartDate
                    ? calculateEndDate(watchStartDate as string, selectedPlan.duration_months)
                    : ''
                }
                readOnly
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                Based on plan duration ({selectedPlan?.duration_months || 0} months)
              </p>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  {...register('auto_renew' as keyof SubscriptionCreateData)}
                  type="checkbox"
                  id="auto_renew"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="auto_renew" className="ml-2 block text-sm text-gray-700">
                  Enable auto-renewal
                </label>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode Fields */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register('end_date' as keyof SubscriptionEditData)}
                type="date"
                id="end_date"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {(errors as { end_date?: { message?: string } }).end_date && (
                <p className="mt-1 text-sm text-red-600">
                  {(errors as { end_date?: { message?: string } }).end_date?.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status' as keyof SubscriptionEditData)}
                id="status"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="past_due">Past Due</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
              {(errors as { status?: { message?: string } }).status && (
                <p className="mt-1 text-sm text-red-600">
                  {(errors as { status?: { message?: string } }).status?.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  {...register('auto_renew' as keyof SubscriptionEditData)}
                  type="checkbox"
                  id="auto_renew"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="auto_renew" className="ml-2 block text-sm text-gray-700">
                  Enable auto-renewal
                </label>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-end border-t border-gray-200 pt-6">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border-2 border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
              ? 'Create Subscription'
              : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
