// components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Radio, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, action }) => {
  const { user } = useAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title || 'Overview'}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {action}

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wider text-[11px]">LIVE SYNC</span>
        </div>

        {/* Demo Mode Badge if applicable */}
        {user?.isDemo && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Demo Mode</span>
          </div>
        )}

        {/* Real-time Clock */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums hidden sm:block">
          {time}
        </div>
      </div>
    </header>
  );
};
