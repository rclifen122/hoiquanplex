import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { SubscriptionEditForm } from '@/components/subscription/subscription-edit-form';

export default async function EditSubscriptionPage({ params }: { params: { id: string } }) {
  const supabase = await createAdminClient();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
            *,
            customer:customers(full_name, email),
            plan:subscription_plans(name, price)
        `)
    .eq('id', params.id)
    .single();

  if (!subscription) {
    notFound();
  }

  return (
    <AdminDashboardLayout>
      <SubscriptionEditForm subscription={subscription} />
    </AdminDashboardLayout>
  );
}
