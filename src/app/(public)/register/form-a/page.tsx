import { createClient } from '@/lib/supabase/server';
import { RegistrationFormA } from '@/components/forms/registration-form-a';

export default async function FormAPage() {
  const supabase = await createClient();

  // Fetch active subscription plans
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('id, name, price, tier, duration_months')
    .eq('is_active', true)
    .order('display_order');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Đăng ký dịch vụ HoiQuanPlex
          </h1>
          <p className="text-lg text-gray-600">
            Hoàn tất form đăng ký để bắt đầu sử dụng dịch vụ
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <RegistrationFormA plans={plans || []} />
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
