'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, Ban } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { calculateRemainingValue } from '@/lib/billing/proration'; // Using generic func

interface Subscription {
    id: string;
    status: string;
    start_date: string;
    end_date: string;
    auto_renew: boolean;
    plan: {
        name: string;
        price: number;
    };
    customer: {
        full_name: string;
        email: string;
    };
}

export function SubscriptionEditForm({ subscription }: { subscription: Subscription }) {
    const router = useRouter();
    const [action, setAction] = useState<'immediate' | 'end_of_period'>('end_of_period');
    const [isLoading, setIsLoading] = useState(false);

    // Calculate refund estimate client-side for UX
    // (Ideally this matches server logic)
    const refundEstimate = calculateRemainingValue(
        new Date(subscription.start_date),
        new Date(subscription.end_date),
        subscription.plan.price
    );

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/subscriptions/${subscription.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    refund_amount: action === 'immediate' ? refundEstimate : 0
                })
            });

            if (!res.ok) throw new Error('Failed to cancel');

            router.push('/admin/subscriptions');
            router.refresh(); // Refresh server components
        } catch {
            alert('Error cancelling subscription');
        } finally {
            setIsLoading(false);
        }
    };

    if (subscription.status === 'cancelled') {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="mb-6">
                    <Link href="/admin/subscriptions" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back
                    </Link>
                </div>
                <div className="rounded-xl bg-red-50 p-8 text-center border border-red-100">
                    <Ban className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Subscription Cancelled</h3>
                    <p className="mt-1 text-sm text-gray-500">This subscription is already inactive.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="mb-6">
                <Link href="/admin/subscriptions" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Subscriptions
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">Manage Subscription</h1>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <div className="mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{subscription.plan.name}</h2>
                    <p className="text-sm text-gray-500">{subscription.customer.full_name} ({subscription.customer.email})</p>
                </div>

                <div className="space-y-6">
                    {/* Action Selection */}
                    <div>
                        <label className="text-base font-semibold text-gray-900">Cancellation Options</label>
                        <p className="text-sm text-gray-500">Select how you want to terminate this subscription.</p>
                        <fieldset className="mt-4">
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="end_of_period"
                                            name="cancellation_type"
                                            type="radio"
                                            checked={action === 'end_of_period'}
                                            onChange={() => setAction('end_of_period')}
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <label htmlFor="end_of_period" className="font-medium text-gray-900">Cancel at end of period</label>
                                        <p className="text-sm text-gray-500">Subscription continues until {formatDate(subscription.end_date)}. No refund required.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="immediate"
                                            name="cancellation_type"
                                            type="radio"
                                            checked={action === 'immediate'}
                                            onChange={() => setAction('immediate')}
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <label htmlFor="immediate" className="font-medium text-gray-900">Cancel immediately</label>
                                        <p className="text-sm text-gray-500">Access is revoked now.</p>

                                        {action === 'immediate' && (
                                            <div className="mt-3 rounded-lg bg-blue-50 p-4 border border-blue-100">
                                                <div className="flex">
                                                    <Calculator className="h-5 w-5 text-blue-400" />
                                                    <div className="ml-3 flex-1">
                                                        <h3 className="text-sm font-medium text-blue-800">Estimated Refund</h3>
                                                        <div className="mt-2 text-sm text-blue-700">
                                                            <p>Based on remaining time:</p>
                                                            <p className="text-xl font-bold">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundEstimate)}
                                                            </p>
                                                            <p className="mt-1 text-xs opacity-75">
                                                                *Calculated from {formatDate(new Date().toISOString())} to {formatDate(subscription.end_date)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                                ${action === 'immediate' ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600' : 'bg-orange-600 hover:bg-orange-500 focus-visible:outline-orange-600'}
                                disabled:opacity-50`}
                        >
                            {isLoading ? 'Processing...' : action === 'immediate' ? 'Cancel & Refund' : 'Disable Auto-Renew'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
