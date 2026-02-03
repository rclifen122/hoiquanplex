import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AdminLoading() {
    return (
        <AdminDashboardLayout>
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        </AdminDashboardLayout>
    );
}
