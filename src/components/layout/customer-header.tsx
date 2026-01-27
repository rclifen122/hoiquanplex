'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/lib/auth/customer-auth-helpers';
import { signOut } from '@/lib/auth/actions';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';


interface CustomerHeaderProps {
  customer: Customer;
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/customer/login');
    router.refresh();
  };

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            type="button"
            className="rounded-md p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white sm:text-xl">
            Khách hàng
          </h1>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/5 hover:border-white/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-plex-yellow to-yellow-600 text-sm font-bold text-black shadow-lg shadow-plex-yellow/20">
              {customer.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-medium text-gray-200 sm:block">
              {customer.full_name}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-[#0A0A0A] py-1.5 shadow-2xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-sm font-medium text-white">{customer.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                </div>

                <div className="p-1">
                  <a
                    href="/customer/profile"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ cá nhân
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
