import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { LoginForm } from '@/components/auth/login-form';

export default async function AdminLoginPage() {
  // Redirect if already logged in as admin
  const adminUser = await getAdminUser();
  if (adminUser) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            HoiQuanPlex CRM
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-700">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white px-8 py-10 shadow-xl">
          <LoginForm />
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>© 2025 HoiQuanPlex. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
