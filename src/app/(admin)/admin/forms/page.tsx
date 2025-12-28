import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/utils/format';

export default async function AdminFormsPage() {
  const supabase = await createClient();

  // Fetch form submissions
  const { data: submissions } = await supabase
    .from('form_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(100);

  const formACount = submissions?.filter((s) => s.form_type === 'form_a').length || 0;
  const formBCount = submissions?.filter((s) => s.form_type === 'form_b').length || 0;
  const convertedCount = submissions?.filter((s) => s.status === 'converted').length || 0;

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage customer registration forms
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">Form A Submissions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formACount}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">Form B Submissions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formBCount}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">Converted</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{convertedCount}</p>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Submissions ({submissions?.length || 0})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  UTM Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {!submissions || submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No form submissions yet
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatDateTime(submission.submitted_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        submission.form_type === 'form_a'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {submission.form_type === 'form_a' ? 'Form A' : 'Form B'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {submission.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {submission.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        submission.status === 'converted'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'new'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {submission.utm_source || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
