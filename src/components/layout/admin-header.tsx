'use client';

import { useState } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { signOut } from '@/lib/auth/actions';

interface AdminHeaderProps {
  adminUser: {
    full_name: string;
    email: string;
    role: string;
  };
}

export function AdminHeader({ adminUser }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-medium">
            {adminUser.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">{adminUser.full_name}</p>
            <p className="text-xs text-gray-500">{adminUser.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowUserMenu(false)}
            ></div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {adminUser.full_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{adminUser.email}</p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(
                    adminUser.role
                  )}`}
                >
                  {formatRole(adminUser.role)}
                </span>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to profile (to be implemented)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
