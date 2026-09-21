// components/auth/AuthGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 shadow-xl shadow-indigo-600/20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
          <p className="mt-4 text-sm text-slate-400 font-medium tracking-wide">
            Connecting to Quick Bill POS...
          </p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
};
