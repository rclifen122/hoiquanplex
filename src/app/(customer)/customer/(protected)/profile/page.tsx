import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { CustomerProfileForm } from '@/components/customer/customer-profile-form';
import { CustomerEmailChangeForm } from '@/components/customer/customer-email-change-form';
import { CustomerAvatarUpload } from '@/components/customer/customer-avatar-upload';

export default async function CustomerProfilePage() {
  const customer = await getCustomer();

  if (!customer) {
    return null;
  }

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  };

  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
  };

  return (
    <CustomerDashboardLayout>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Ảnh đại diện</h2>
            <CustomerAvatarUpload customer={customer} />
          </div>

          {/* Profile Information */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Thông tin cá nhân
            </h2>
            <div className="mb-6 space-y-3 border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Gói dịch vụ</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[customer.tier]}`}>
                  {tierLabels[customer.tier]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Mã khách hàng</span>
                <span className="font-mono text-sm text-gray-900">{customer.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Ngày đăng ký</span>
                <span className="text-sm text-gray-900">
                  {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
            <CustomerProfileForm customer={customer} />
          </div>

          {/* Email Change */}
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Đổi địa chỉ email</h2>
            <p className="mb-4 text-sm text-gray-600">
              Email hiện tại: <span className="font-medium text-gray-900">{customer.email}</span>
            </p>
            <CustomerEmailChangeForm />
          </div>

          {/* Account Info */}
          <div className="rounded-lg bg-yellow-50 p-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Lưu ý</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              <li>Gói dịch vụ chỉ có thể được thay đổi bởi quản trị viên</li>
              <li>Khi đổi email, bạn sẽ nhận được email xác nhận tại địa chỉ mới</li>
              <li>Vui lòng xác nhận email mới trong vòng 24 giờ</li>
            </ul>
          </div>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
