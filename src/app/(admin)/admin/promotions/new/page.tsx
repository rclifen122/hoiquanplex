import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { PromotionForm } from '@/components/promotions/promotion-form';

export default function NewPromotionPage() {
    return (
        <AdminDashboardLayout>
            <PromotionForm />
        </AdminDashboardLayout>
    );
}
