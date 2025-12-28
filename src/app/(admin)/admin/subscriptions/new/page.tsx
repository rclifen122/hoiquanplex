import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { SubscriptionForm } from '@/components/admin/subscription-form';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminNewSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string }>;
}) {
  const { customer_id } = await searchParams;
  const supabase = await createClient();

  // Fetch all customers for dropdown
  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name, email')
    .order('full_name');

  // Fetch active subscription plans
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  // If customer_id is provided, fetch customer details
  let preselectedCustomer = null;
  if (customer_id) {
    const { data } = await supabase
      .from('customers')
      .select('id, full_name, email')
      .eq('id', customer_id)
      .single();
    preselectedCustomer = data;
  }

  return (
    <AdminDashboardLayout>
      <div>
        <div className="mb-6">
          <Link
            href="/admin/subscriptions"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Back to Subscriptions
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Subscription</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manually create a subscription for a customer
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <SubscriptionForm
            mode="create"
            customers={customers || []}
            plans={plans || []}
            preselectedCustomerId={preselectedCustomer?.id}
          />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
