'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, CreditCard, Settings, LogOut } from 'lucide-react';
import { Customer } from '@/lib/auth/customer-auth-helpers';
import { signOut } from '@/lib/auth/actions';

interface UserDropdownProps {
    customer: Customer;
}

export function UserDropdown({ customer }: UserDropdownProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.refresh(); // Refresh to update server components (Header)
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 group focus:outline-none"
            >
                <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow ring-2 ring-transparent group-hover:ring-white transition-all">
                    {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 border border-white/20 rounded-md shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md">
                        <div className="p-3 border-b border-white/10">
                            <p className="text-xs text-gray-400">Đăng nhập với</p>
                            <p className="text-sm font-bold text-white truncate">{customer.full_name}</p>
                        </div>

                        <div className="py-2">
                            <Link
                                href="/customer/profile"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <User className="w-4 h-4" /> Hồ sơ cá nhân
                            </Link>
                            <Link
                                href="/customer/subscription"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <CreditCard className="w-4 h-4" /> Gói dịch vụ
                            </Link>
                            <Link
                                href="/customer/settings"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="w-4 h-4" /> Cài đặt
                            </Link>
                        </div>

                        <div className="border-t border-white/10 py-2">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" /> Đăng xuất
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
