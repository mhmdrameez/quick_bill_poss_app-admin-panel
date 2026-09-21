// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';
import { JsonLd } from '@/components/seo/JsonLd';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: 'Quick Bill POS — Admin Command Center',
    template: '%s | Quick Bill POS Admin',
  },
  description:
    'Real-time centralized retail command center, catalog management, POS register monitoring, and transaction analytics hub for Quick Bill POS.',
  keywords: [
    'POS Admin Panel',
    'Quick Bill POS',
    'Point of Sale Management',
    'Cloud POS Sync',
    'Firestore POS',
    'Inventory Catalog Manager',
    'Retail Sales Analytics',
    'Thermal Receipt Customizer',
    'PWA POS Admin',
  ],
  authors: [{ name: 'Quick Bill POS Engineering Team', url: 'https://quickbillpos.com' }],
  creator: 'Quick Bill POS',
  publisher: 'Quick Bill POS',
  applicationName: 'Quick Bill POS Admin',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://quickbillpos.com'),
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QuickBill Admin',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://quickbillpos.com',
    siteName: 'Quick Bill POS Admin Command Center',
    title: 'Quick Bill POS — Real-Time Admin Command Center',
    description:
      'Centralized real-time store management, instant catalog sync, POS register monitoring, and live analytics for Quick Bill POS.',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Quick Bill POS Admin Command Center',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick Bill POS — Admin Command Center',
    description:
      'Real-time retail management, live POS terminal sync, and transaction analytics.',
    images: ['/logo.svg'],
    creator: '@quickbillpos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <JsonLd />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <AuthGuard>
            <div className="flex w-full min-h-screen flex-1">
              <Sidebar />
              <main className="flex-1 min-w-0 flex flex-col bg-slate-950 overflow-x-hidden pb-20 lg:pb-0">
                {children}
              </main>
            </div>
            <MobileNav />
            <PwaInstallPrompt />
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
