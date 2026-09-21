// src/components/auth/AuthGuard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC<{ children: React.ReactNode; currentPath?: string }> = ({
  children,
  currentPath,
}) => {
  const { user, loading } = useAuth();
  const [pathname, setPathname] = useState<string>(currentPath || '');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!loading) {
      const current = window.location.pathname;
      if (!user && current !== '/login') {
        window.location.replace('/login');
      } else if (user && current === '/login') {
        window.location.replace('/dashboard');
      }
    }
  }, [user, loading]);

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

  // If not logged in and not on login page, wait for redirect to /login
  if (!user && pathname !== '/login') {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/10">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400 tracking-wide">
          Authenticating session...
        </p>
      </div>
    );
  }

  // If already logged in and on login page, show redirecting state
  if (user && pathname === '/login') {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/10">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400 tracking-wide">
          Already signed in. Redirecting to Dashboard...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
