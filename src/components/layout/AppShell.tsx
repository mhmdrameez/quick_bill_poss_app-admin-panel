// src/components/layout/AppShell.tsx
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  currentPath?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  subtitle,
  action,
  currentPath,
}) => {
  return (
    <AuthProvider>
      <AuthGuard currentPath={currentPath}>
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
          {/* Desktop Left Sidebar */}
          <Sidebar currentPath={currentPath} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
            {/* Top Navigation Bar */}
            <Header title={title} subtitle={subtitle} action={action} />

            {/* Scrollable Page Body */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation Bar & Slide Drawer */}
          <MobileNav currentPath={currentPath} />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
};
