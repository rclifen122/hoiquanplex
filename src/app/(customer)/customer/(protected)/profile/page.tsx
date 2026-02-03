import { CustomerDashboardLayout } from '@/components/layout/customer-dashboard-layout';
import { getCustomer } from '@/lib/auth/customer-auth-helpers';
import { CustomerProfileForm } from '@/components/customer/customer-profile-form';
import { CustomerEmailChangeForm } from '@/components/customer/customer-email-change-form';
import { CustomerAvatarUpload } from '@/components/customer/customer-avatar-upload';
import { User, Mail, ShieldAlert } from 'lucide-react';

export default async function CustomerProfilePage() {
  const customer = await getCustomer();

  if (!customer) {
    return null;
  }

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    plus: 'Plus',
    pro: 'Pro',
    max: 'Max',
  };

  const tierColors = {
    free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    plus: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    max: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  return (
    <CustomerDashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">Hồ sơ cá nhân</h1>
          <p className="mt-2 text-gray-400">Quản lý thông tin tài khoản và bảo mật.</p>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <User className="h-5 w-5 text-plex-yellow" />
              Ảnh đại diện
            </h2>
            <div className="bg-white/5 rounded-lg p-6">
              <CustomerAvatarUpload customer={customer} />
            </div>
          </div>

          {/* Profile Information */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <User className="h-5 w-5 text-plex-yellow" />
              Thông tin cá nhân
            </h2>
            <div className="mb-8 space-y-4 border-b border-white/10 pb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Gói dịch vụ</span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${tierColors[customer.tier]}`}>
                  {tierLabels[customer.tier]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Mã khách hàng</span>
                <span className="font-mono text-sm text-gray-200">{customer.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Ngày đăng ký</span>
                <span className="text-sm text-gray-200">
                  {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
            {/* Note: CustomerProfileForm likely has white backgrounds internally. 
                Users might see a white form inside a dark card. 
                Ideally we refactor CustomerProfileForm too, but for this task scope we wrap it nicely. */}
            <div className="bg-white/5 rounded-lg p-6">
              <CustomerProfileForm customer={customer} />
            </div>
          </div>

          {/* Email Change */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <Mail className="h-5 w-5 text-plex-yellow" />
              Đổi địa chỉ email
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              Email hiện tại: <span className="font-medium text-white">{customer.email}</span>
            </p>
            <div className="bg-white/5 rounded-lg p-6">
              <CustomerEmailChangeForm />
            </div>
          </div>

          {/* Account Info */}
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-500">
              <ShieldAlert className="h-4 w-4" />
              Lưu ý
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-400">
              <li>Gói dịch vụ chỉ có thể được thay đổi bởi quản trị viên (hoặc nâng cấp tự động).</li>
              <li>Khi đổi email, bạn sẽ nhận được email xác nhận tại địa chỉ mới.</li>
              <li>Vui lòng xác nhận email mới trong vòng 24 giờ.</li>
            </ul>
          </div>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
