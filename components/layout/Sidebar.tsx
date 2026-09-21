// components/layout/Sidebar.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  Package,
  TicketPercent,
  ClipboardList,
  Smartphone,
  TrendingUp,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';

export const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/sales', icon: Receipt },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Coupons', href: '/coupons', icon: TicketPercent },
  { name: 'Held Orders', href: '/orders', icon: ClipboardList },
  { name: 'POS Registers', href: '/devices', icon: Smartphone },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Store Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (pathname === '/login') return null;

  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex-col justify-between shrink-0 select-none sticky top-0 h-screen">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-white tracking-tight leading-tight">
              QUICK BILL <span className="text-indigo-400">POS</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Admin Command
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* User Section & Sign Out */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold flex items-center justify-center text-sm border border-indigo-500/30">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-white truncate">
              {user?.displayName || 'Admin'}
            </span>
            <span className="text-[11px] text-slate-400 truncate">
              {user?.email || 'admin@quickbillpos.com'}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/30 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
