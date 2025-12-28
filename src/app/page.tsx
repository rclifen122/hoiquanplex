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

        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <h2 className="mb-2 font-semibold text-green-900">
              ✅ Deployment Successful
            </h2>
            <p className="text-sm text-green-700">
              Your HoiQuanPlex CRM application has been deployed successfully!
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">
              📦 Project Setup Complete
            </h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Next.js 14 + TypeScript</li>
              <li>• Supabase Database</li>
              <li>• Tailwind CSS</li>
              <li>• Ready for feature development</li>
            </ul>
          </div>

          <div className="rounded-lg bg-amber-50 p-4">
            <h3 className="mb-2 font-semibold text-amber-900">
              🚧 Next Steps
            </h3>
            <ul className="space-y-1 text-sm text-amber-700">
              <li>• Configure environment variables</li>
              <li>• Set up Supabase database</li>
              <li>• Implement admin authentication</li>
              <li>• Build customer management features</li>
            </ul>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Domain: hoiquanplex.site</p>
            <p className="mt-1">Version 1.0.0 - Setup Phase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
