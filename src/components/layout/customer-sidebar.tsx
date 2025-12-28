'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Customer } from '@/lib/auth/customer-auth-helpers';

interface CustomerSidebarProps {
  customer: Customer;
}

export function CustomerSidebar({ customer }: CustomerSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Tổng quan', href: '/customer', icon: '📊' },
    { name: 'Gói dịch vụ', href: '/customer/subscription', icon: '📦' },
    { name: 'Lịch sử thanh toán', href: '/customer/payments', icon: '💳' },
    { name: 'Hồ sơ cá nhân', href: '/customer/profile', icon: '👤' },
  ];

  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
  };

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  };

  return (
    <div className="hidden w-64 overflow-y-auto bg-white shadow-lg md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
          <Link href="/customer" className="text-xl font-bold text-gray-900">
            HoiQuanPlex
          </Link>
        </div>

        {/* Customer info */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              {customer.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {customer.full_name}
              </p>
              <p className="truncate text-xs text-gray-500">{customer.email}</p>
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[customer.tier]}`}
            >
              {tierLabels[customer.tier]}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <Link
            href="/"
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
