'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Customer } from '@/lib/auth/customer-auth-helpers';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  CreditCard,
  Package,
  User,
  LogOut,
  Home
} from 'lucide-react';

interface CustomerSidebarProps {
  customer: Customer;
}

export function CustomerSidebar({ customer }: CustomerSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Tổng quan', href: '/customer', icon: BarChart3 },
    { name: 'Gói dịch vụ', href: '/customer/subscription', icon: Package },
    { name: 'Lịch sử thanh toán', href: '/customer/payments', icon: CreditCard },
    { name: 'Hồ sơ cá nhân', href: '/customer/profile', icon: User },
  ];

  const tierColors = {
    free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pro: 'bg-plex-yellow/20 text-plex-yellow border-plex-yellow/30',
  };

  const tierLabels = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  };

  return (
    <div className="hidden w-72 overflow-y-auto border-r border-white/10 bg-black/90 backdrop-blur-xl md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/customer" className="flex items-center gap-2 font-bold">
            <span className="text-xl text-white">HoiQuan</span>
            <span className="text-xl text-plex-yellow">Plex</span>
          </Link>
        </div>

        {/* Customer info */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-plex-yellow/10 text-plex-yellow ring-2 ring-plex-yellow/20">
              <span className="text-lg font-bold">
                {customer.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {customer.full_name}
              </p>
              <p className="truncate text-xs text-gray-400">{customer.email}</p>
            </div>
          </div>
          <div className="mt-4">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
                tierColors[customer.tier]
              )}
            >
              {tierLabels[customer.tier]}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-plex-yellow/10 text-plex-yellow shadow-[0_0_20px_rgba(229,160,13,0.1)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-plex-yellow" : "text-gray-500 group-hover:text-white"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
