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
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">Dashboard Overview</h2>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition-colors group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plex-yellow text-black font-bold shadow-lg shadow-plex-yellow/20 group-hover:scale-105 transition-transform">
            {adminUser.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-bold text-white group-hover:text-plex-yellow transition-colors">{adminUser.full_name}</p>
            <p className="text-xs text-gray-400">{adminUser.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
        </button>

        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowUserMenu(false)}
            ></div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl bg-black/90 border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-white/10">
                <p className="text-sm font-bold text-white">
                  {adminUser.full_name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{adminUser.email}</p>
                <span
                  className={`mt-2 inline-block rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(
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
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
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

