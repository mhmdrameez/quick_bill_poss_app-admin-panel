// app/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Zap, RefreshCw, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already signed in
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 bg-slate-950 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/10">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400 tracking-wide">
          Already signed in. Redirecting to Dashboard...
        </p>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.replace('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'Could not sign in with Google. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 bg-radial from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/20">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              QUICK BILL <span className="text-indigo-400">POS</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Centralized Merchant Admin Command Center
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-bold text-white">Merchant Authentication</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in with the Google account connected to your POS counter devices.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-1">
            <GoogleSignInButton onClick={handleGoogleLogin} loading={loading} />
          </div>

          {/* Security & Cloud Sync Badges */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="text-[11px] font-semibold text-slate-300">Live Sync</div>
                <div className="text-[9px] text-slate-500">Real-Time Cloud</div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <div className="text-left">
                <div className="text-[11px] font-semibold text-slate-300">Secure Access</div>
                <div className="text-[9px] text-slate-500">Google OAuth</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          © Quick Bill POS • Point of Sale Command Center
        </p>
      </div>
    </div>
  );
}
