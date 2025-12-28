import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            HoiQuanPlex CRM
          </h1>
          <p className="text-lg text-gray-600">
            Customer Registration & Subscription Management
          </p>
        </div>

        <div className="space-y-6">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Admin Login */}
            <Link
              href="/admin/login"
              className="group rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all hover:border-gray-400 hover:shadow-lg"
            >
              <div className="mb-2 text-3xl">🔐</div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                Admin Portal
              </h3>
              <p className="text-sm text-gray-600">
                Manage customers, subscriptions, and analytics
              </p>
            </Link>

            {/* Customer Login */}
            <Link
              href="/customer/login"
              className="group rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 transition-all hover:border-blue-400 hover:shadow-lg"
            >
              <div className="mb-2 text-3xl">👤</div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                Customer Login
              </h3>
              <p className="text-sm text-gray-600">
                Access your account and subscription
              </p>
            </Link>
          </div>

          {/* Registration */}
          <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
            <div className="mb-4 text-center">
              <div className="mb-2 text-3xl">📝</div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                New Customer?
              </h3>
              <p className="text-sm text-gray-600">
                Register for a new account to get started
              </p>
            </div>
            <Link
              href="/register/form-a"
              className="block w-full rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-green-500"
            >
              Register Now
            </Link>
          </div>

          {/* System Status */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700">System Status: Online</span>
              </div>
              <span className="text-xs text-gray-500">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
