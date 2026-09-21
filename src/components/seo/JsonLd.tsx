// components/seo/JsonLd.tsx
import React from 'react';

export const JsonLd: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Quick Bill POS — Admin Command Center',
    operatingSystem: 'Web, Android, iOS, Windows, macOS, Linux',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'INR',
    },
    description:
      'Centralized real-time command center, inventory manager, POS register monitor, and sales analytics platform for Quick Bill POS.',
    featureList: [
      'Real-time bi-directional sync with Firestore and POS terminals',
      'Integer currency calculations preventing rounding errors',
      'Immutable audit event trail for bill edits and cancellations',
      'Live product catalog management with CSV bulk import',
      'Parked and held cart monitoring across counter hardware',
      'Visual thermal receipt mockup and ESC/POS preview',
      'Deep business intelligence, revenue velocity, and customer loyalty analytics',
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Quick Bill POS',
      url: 'https://quickbillpos.com',
      logo: 'https://quickbillpos.com/logo.svg',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
