import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth/auth-helpers';
import { LoginForm } from '@/components/auth/login-form';

export default async function AdminLoginPage() {
  // Redirect if already logged in as admin
  const adminUser = await getAdminUser();
  if (adminUser) {
    redirect('/admin');
  }

  <div className="flex min-h-screen items-center justify-center bg-cinematic px-4 py-12 sm:px-6 lg:px-8">
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black tracking-tighter text-plex-yellow uppercase drop-shadow-lg">HoiQuanPlex</h1>
        <h2 className="mt-2 text-xl font-bold text-white tracking-wide uppercase">
          Admin Portal
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Khu vực quản trị hệ thống
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 shadow-2xl ring-1 ring-white/10">
        <LoginForm />
      </div>

      <div className="text-center mt-8 text-xs text-gray-600 uppercase tracking-widest">
        <p>© 2025 HoiQuanPlex. All rights reserved.</p>
      </div>
    </div>
  </div>
  );
}

