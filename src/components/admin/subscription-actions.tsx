'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  cancelSubscription,
  extendSubscription,
  deleteSubscription,
} from '@/lib/actions/subscription-admin-actions';

interface SubscriptionActionsProps {
  subscription: {
    id: string;
    status: string;
  };
}

export function SubscriptionActions({ subscription }: SubscriptionActionsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendMonths, setExtendMonths] = useState(1);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    const reason = prompt('Cancellation reason (optional):');

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await cancelSubscription(subscription.id, reason || undefined);

      if (result.success) {
        setMessage({ type: 'success', text: 'Subscription cancelled successfully' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to cancel subscription' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtend = async () => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await extendSubscription(subscription.id, extendMonths);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Subscription extended by ${extendMonths} month${extendMonths > 1 ? 's' : ''}`,
        });
        setShowExtendModal(false);
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to extend subscription' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this subscription? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await deleteSubscription(subscription.id);

      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Failed to delete subscription' });
        setIsProcessing(false);
      }
      // If successful, redirect happens in the action
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Actions</h2>

      {message && (
        <div
          className={`mb-4 rounded-lg p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {subscription.status === 'active' && (
          <>
            <button
              onClick={() => setShowExtendModal(true)}
              disabled={isProcessing}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Extend Subscription
            </button>
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="rounded-lg border-2 border-yellow-600 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel Subscription
            </button>
          </>
        )}
        {(subscription.status === 'cancelled' || subscription.status === 'expired') && (
          <button
            onClick={handleDelete}
            disabled={isProcessing}
            className="rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? 'Deleting...' : 'Delete Subscription'}
          </button>
        )}
      </div>

      {/* Extend Modal */}
      {showExtendModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setShowExtendModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Extend Subscription
              </h3>
              <div className="mb-4">
                <label htmlFor="months" className="block text-sm font-medium text-gray-700">
                  Additional Months
                </label>
                <input
                  type="number"
                  id="months"
                  min="1"
                  max="24"
                  value={extendMonths}
                  onChange={(e) => setExtendMonths(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtend}
                  disabled={isProcessing}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? 'Extending...' : 'Extend'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
