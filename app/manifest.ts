// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quick Bill POS — Admin Command Center',
    short_name: 'QuickBill Admin',
    description:
      'Real-time centralized retail management, inventory catalog, POS register monitoring, and transaction analytics command center for Quick Bill POS.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#4f46e5',
    orientation: 'any',
    categories: ['business', 'finance', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Live Dashboard',
        short_name: 'Dashboard',
        description: 'View real-time revenue KPIs and charts',
        url: '/dashboard',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
      {
        name: 'Transaction History',
        short_name: 'Sales',
        description: 'Browse and edit sales transactions',
        url: '/sales',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
      {
        name: 'Product Catalog',
        short_name: 'Products',
        description: 'Manage store inventory and pricing',
        url: '/products',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
      {
        name: 'Deep Analytics',
        short_name: 'Analytics',
        description: 'Explore revenue and customer intelligence',
        url: '/analytics',
        icons: [{ src: '/icon.svg', sizes: '96x96' }],
      },
    ],
  };
}
