import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout';
import { createAdminClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';

export default async function AdminPromotionsPage() {
    const supabase = await createAdminClient();

    // Fetch all promotions
    const { data: promotions } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

    // const totalPromotions = promotions?.length || 0;
    // const activePromotions = promotions?.filter((c) => c.is_active).length || 0;

    return (
        <AdminDashboardLayout>
            <div>
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Promotions & Coupons</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage discount codes and promotional campaigns
                        </p>
                    </div>
                    <Link
                        href="/admin/promotions/new"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        + Create Promotion
                    </Link>
                </div>

                {/* Promotions Table */}
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Discount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Expires
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {!promotions || promotions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No promotions created yet
                                        </td>
                                    </tr>
                                ) : (
                                    promotions.map((promo) => (
                                        <tr key={promo.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-bold text-blue-600">{promo.code}</div>
                                                {promo.description && <div className="text-xs text-gray-500 mt-1">{promo.description}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {promo.discount_type === 'percent' ? (
                                                    <span className="font-medium text-green-600">-{promo.discount_value}%</span>
                                                ) : (
                                                    <span className="font-medium text-green-600">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.discount_value)}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {promo.current_uses} / {promo.max_uses ? promo.max_uses : '∞'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {promo.is_active ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {promo.expires_at ? formatDate(promo.expires_at) : 'No Expiry'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(promo.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminDashboardLayout>
    );
}
