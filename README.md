# Quick Bill POS — Admin Command Center

A modern, real-time **Next.js Web Application** serving as the centralized management and analytics dashboard for the **Quick Bill POS** ecosystem. It connects directly to the same **Firebase project and Firestore database** used by the Quick Bill POS React Native mobile terminals.

---

## ⚡ Key Highlights

- **Real-Time Bi-Directional Sync**: Firestore snapshot listeners ensure changes in the Admin Panel appear on POS counter devices within seconds, and POS transactions update the admin dashboard live.
- **Same Account, Same Data**: Authenticates with **Google Sign-In** using the same merchant Google account, scoping all queries and mutations strictly under `users/{uid}/*`.
- **Integer Currency Law**: All currency values are stored as integer paise (`₹1.00 = 100 paise`), eliminating floating-point rounding errors across web and POS terminals.
- **Immutable Audit Trail**: All bill edits and cancellations automatically append immutable audit event sub-documents (`audit_events/{id}`).
- **Sync Reconciliation Metadata**: Writes include `_rev`, `_lastOpId`, `_lastModifiedBy = 'ADMIN_WEB'`, and `_serverUpdatedAt` to preserve conflict-free offline/online syncing.
- **Built-in Demo Mode**: Instant one-click demo access for local testing and presentation without prior Firebase credentials.

---

## 🛠️ Features & Modules

| Module | Route | Highlights |
|---|---|---|
| **Dashboard** | `/dashboard` | 6 Real-time KPI cards, interactive Recharts revenue timeline (Today hourly, Yesterday, 7D, 30D), tender method donut chart, top 5 products velocity ranking, live activity feed. |
| **Transactions** | `/sales` | Filterable sales table, multi-criteria search, CSV export, slide-out sale receipt drawer with audit trail, live integer calculation bill editor, and cancellation confirmation with coupon reversal. |
| **Product Catalog** | `/products` | Catalog table with low-stock warnings (&lt;10 orange, 0 red), Add/Edit product modal (Rupee input &rarr; converted to integer paise), and Bulk CSV import with preview and batch writes. |
| **Promotions & Coupons** | `/coupons` | Fixed ₹ and percentage discount codes, max redemption quotas, expiration dates, customer assignment, and redemption history tracking. |
| **Held / Parked Orders** | `/orders` | Inspect in-progress carts held by cashiers on POS terminals, with discard actions synced directly to hardware. |
| **POS Registers** | `/devices` | Read-only register terminal monitor tracking hardware UUIDs, lease status, epoch counters, and sync heartbeats. |
| **Store & Receipt Settings** | `/settings` | Business details, GSTIN, tax toggles, receipt headers/footers, and **live thermal receipt mockup preview**. |
| **Deep Analytics** | `/analytics` | Daily/monthly sales velocity, product category breakdown, zero-sale slow movers, and customer directory with repeat spenders. |

---

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language**: TypeScript (Strict mode matching mobile domain models)
- **Styling**: Tailwind CSS (Curated dark palette with Indigo, Emerald, Amber, Rose accents)
- **Database & Auth**: Firebase Web SDK v9+ (Auth Google Provider + Firestore `onSnapshot`)
- **Charts**: Recharts
- **Icons**: Lucide React
- **ID Generation**: UUID v4

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- An existing Firebase project with **Authentication (Google Provider)** and **Firestore Database** enabled.

### 2. Installation
Clone the repository and install dependencies:

```bash
npm install
```

### 3. Environment Setup
Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Fill in your Firebase Web App configuration in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your-sender-id:web:your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> **Note**: If `.env.local` is not configured, you can click **"Enter Demo Mode"** on the login page to immediately test the UI with rich sample data!

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
quick-bill-poss_admin/
├── app/
│   ├── layout.tsx                # Root layout, AuthProvider, AuthGuard & Sidebar
│   ├── page.tsx                  # Root redirect handler
│   ├── login/page.tsx            # Branded Google Sign-In & Demo Access
│   ├── dashboard/page.tsx        # KPIs, Revenue Chart, Payment Donut, Live Feed
│   ├── sales/page.tsx            # Transactions, Filters, Drawer, Edit & Cancel
│   ├── products/page.tsx         # Product Catalog CRUD & CSV Bulk Import
│   ├── coupons/page.tsx          # Discount Coupons & Redemptions
│   ├── orders/page.tsx           # Held / Parked Carts
│   ├── devices/page.tsx          # POS Registers Monitor
│   ├── settings/page.tsx         # Store Settings & Live Thermal Receipt Preview
│   └── analytics/page.tsx        # Revenue Velocity & Customer Intelligence
├── components/
│   ├── auth/                     # AuthGuard, GoogleSignInButton
│   ├── common/                   # CurrencyDisplay, StatusBadge, PaymentBadge, Modal, ConfirmDialog
│   ├── layout/                   # Sidebar, Header, Live Pulse
│   ├── products/                 # ProductModal, BulkImportModal
│   ├── sales/                    # SaleDetailDrawer, EditSaleModal, CancelConfirmDialog
│   ├── coupons/                  # CouponModal, CouponRedemptionsModal
│   └── settings/                 # ReceiptPreview (Thermal mockup)
├── context/
│   └── AuthContext.tsx           # Google Auth, session persistence, demo state
├── hooks/
│   ├── useSales.ts               # Firestore sales snapshots & mutations
│   ├── useProducts.ts            # Firestore products CRUD & CSV batch import
│   ├── useCoupons.ts             # Firestore coupons & redemptions
│   ├── useSavedOrders.ts         # Firestore held orders
│   ├── useRegisters.ts           # POS registers lease reader
│   ├── useSettings.ts            # Store settings listener & updater
│   └── useDashboardStats.ts      # KPI math and aggregation helpers
├── lib/
│   ├── types.ts                  # Shared TypeScript models
│   ├── currency.ts               # Integer currency math (rupeesToPaise, paiseToRupees)
│   ├── sync-metadata.ts          # _rev, _lastOpId, audit event generator
│   ├── dates.ts                  # Date formatting and range helpers
│   ├── firebase.ts               # Firebase App, Auth, Firestore init
│   └── sample-data.ts            # Demo preview dataset
├── .env.local.example
└── README.md
```

---

## 🔒 Security Rules & Firestore Schema

All Firestore collections live scoped under the merchant UID:

```
users/{uid}/
├── sales/{saleId}                      ← Completed sales
│   └── audit_events/{eventId}          ← Immutable edit / cancel records
├── products/{productId}                ← Catalog items
├── coupons/{couponId}                  ← Active discount codes
├── couponRedemptions/{redemptionId}    ← Usage records
├── savedOrders/{orderId}               ← Held orders
├── registers/{registerCode}            ← POS register leases
└── settings/store_settings             ← Business credentials & tax rate
```

---

## 🤝 Git Workflow (Pushing to GitHub)

If pushing to a new repository on GitHub:

```bash
git add .
git commit -m "feat: complete Quick Bill POS Admin Panel Next.js web application"
git branch -M main
git push -u origin main
```

---

## 📄 License
Private repository & proprietary software of Quick Bill POS.
