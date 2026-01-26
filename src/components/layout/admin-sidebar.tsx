'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Mail,
  Settings,
  PackagePlus,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: PackagePlus },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Forms', href: '/admin/forms', icon: FileText },
  { name: 'Emails', href: '/admin/emails', icon: Mail },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-black/90 border-r border-white/10 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
        <h1 className="text-xl font-black text-plex-yellow tracking-tighter uppercase drop-shadow-md">HoiQuanPlex</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all duration-200 ${isActive
                  ? 'bg-plex-yellow text-black shadow-lg shadow-plex-yellow/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-black' : 'text-gray-500 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4 text-xs text-gray-500">
        <p>Version 2.0.0 (Cinematic)</p>
        <p>© 2025 HoiQuanPlex</p>
      </div>
    </div>
  );
}

