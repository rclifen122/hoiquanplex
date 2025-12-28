'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/actions/customer-admin-actions';

const customerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  facebook_profile: z.string().url('Invalid URL').optional().or(z.literal('')),
  tier: z.enum(['free', 'basic', 'pro']),
  status: z.enum(['active', 'inactive', 'suspended']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  mode: 'create' | 'edit';
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    facebook_profile: string | null;
    tier: 'free' | 'basic' | 'pro';
    status: 'active' | 'inactive' | 'suspended';
  };
}

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: mode === 'edit' && customer ? {
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone || '',
      facebook_profile: customer.facebook_profile || '',
      tier: customer.tier,
      status: customer.status,
    } : {
      tier: 'free',
      status: 'active',
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'create') {
        if (!data.password) {
          setMessage({ type: 'error', text: 'Password is required' });
          setIsLoading(false);
          return;
        }

        const result = await createCustomer({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          facebook_profile: data.facebook_profile,
          tier: data.tier,
          status: data.status,
          password: data.password,
        });

        if (result.success) {
          router.push(`/admin/customers/${result.customerId}`);
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to create customer' });
        }
      } else if (mode === 'edit' && customer) {
        const result = await updateCustomer(customer.id, {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          facebook_profile: data.facebook_profile,
          tier: data.tier,
          status: data.status,
        });

        if (result.success) {
          setMessage({ type: 'success', text: 'Customer updated successfully' });
          router.refresh();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update customer' });
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;

    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCustomer(customer.id);

      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Failed to delete customer' });
        setIsDeleting(false);
      }
      // If successful, redirect happens in the action
    } catch {
      setMessage({ type: 'error', text: 'An error occurred while deleting' });
      setIsDeleting(false);
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('full_name')}
            type="text"
            id="full_name"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {mode === 'create' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Min. 8 characters"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="facebook_profile" className="block text-sm font-medium text-gray-700">
            Facebook Profile
          </label>
          <input
            {...register('facebook_profile')}
            type="url"
            id="facebook_profile"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://facebook.com/profile"
          />
          {errors.facebook_profile && (
            <p className="mt-1 text-sm text-red-600">{errors.facebook_profile.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tier" className="block text-sm font-medium text-gray-700">
            Tier <span className="text-red-500">*</span>
          </label>
          <select
            {...register('tier')}
            id="tier"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
          </select>
          {errors.tier && (
            <p className="mt-1 text-sm text-red-600">{errors.tier.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            id="status"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <div>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
              className="rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Customer'}
            </button>
          )}
        </div>
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
            disabled={isLoading || isDeleting}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Customer' : 'Save Changes')}
          </button>
        </div>
      </div>
    </form>
  );
}
