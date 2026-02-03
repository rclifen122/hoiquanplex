import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CustomerLoading() {
    return (
        <CustomerDashboardLayout>
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        </CustomerDashboardLayout>
    );
}
