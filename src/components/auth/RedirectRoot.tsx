// src/components/auth/RedirectRoot.tsx
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const RedirectRootContent: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!loading) {
      if (user) {
        window.location.replace('/dashboard');
      } else {
        window.location.replace('/login');
      }
    }
  }, [user, loading]);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-8">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/10">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-400 tracking-wide">
        Connecting to Quick Bill POS...
      </p>
    </div>
  );
};

export const RedirectRoot: React.FC = () => {
  return (
    <AuthProvider>
      <RedirectRootContent />
    </AuthProvider>
  );
};
export default RedirectRoot;
