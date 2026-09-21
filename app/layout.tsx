// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Quick Bill POS — Admin Command Center',
  description: 'Centralized admin panel and real-time management hub for Quick Bill POS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex antialiased">
        <AuthProvider>
          <AuthGuard>
            <div className="flex w-full min-h-screen">
              <Sidebar />
              <main className="flex-1 min-w-0 flex flex-col bg-slate-950 overflow-x-hidden">
                {children}
              </main>
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
