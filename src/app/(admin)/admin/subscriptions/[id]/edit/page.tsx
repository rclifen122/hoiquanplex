import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { SubscriptionForm } from '@/components/admin/subscription-form';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AdminEditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch subscription
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !subscription) {
    notFound();
  }

  return (
    <AdminDashboardLayout>
      <div>
        <div className="mb-6">
          <Link
            href={`/admin/subscriptions/${id}`}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Back to Subscription
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Subscription</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update subscription details
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <SubscriptionForm mode="edit" subscription={subscription} />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
