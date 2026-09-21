// lib/types.ts

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'split';
export type SaleStatus = 'draft' | 'completed' | 'cancelled';
export type CouponType = 'fixed' | 'percent';
export type CouponStatus = 'active' | 'used' | 'expired' | 'cancelled';
export type RegisterLeaseStatus = 'ACTIVE' | 'RELEASED' | 'EXPIRED' | 'RETIRED';

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface CartItem {
  id: string;
  name: string;
  unitPricePaise: number;
  quantity: number;
  barcode?: string;
  category?: string;
}

export interface Product {
  id: string;
  name: string;
  pricePaise: number;       // Integer currency (₹1 = 100 paise)
  barcode?: string;
  category?: string;
  stock?: number;
  createdAt: number;        // Unix timestamp ms
  updatedAt: number;
  isDeleted?: boolean;
  _rev?: number;
  _lastOpId?: string;
  _lastModifiedBy?: string;
  _serverUpdatedAt?: any;
}

export interface CompletedSale {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  createdAt: number;
  updatedAt: number;
  completedAt: number;
  customer?: Customer;
  items: CartItem[];
  subtotalPaise: number;
  taxPaise: number;
  discountPaise: number;
  grandTotalPaise: number;
  paymentMethod: PaymentMethod;
  amountPaidPaise?: number;
  changePaise?: number;
  status: SaleStatus;
  appliedCouponCode?: string;
  appliedCouponId?: string;
  issuedCouponCode?: string;
  editedAt?: number;
  cancelledAt?: number;
  registerCode?: string;
  registrationEpoch?: number;
  _rev?: number;
  _lastOpId?: string;
  _lastModifiedBy?: string;
  _serverUpdatedAt?: any;
}

export interface AuditEvent {
  id: string;
  saleId: string;
  actorUid: string;
  operationId: string;
  rev: number;
  operationType: 'CREATE' | 'EDIT' | 'CANCEL';
  source: 'ADMIN_WEB' | 'POS_DEVICE';
  timestamp: number;
  details?: Record<string, any>;
}

export interface Coupon {
  id: string;
  code: string;
  amountPaise: number;
  discountPercent?: number;
  type: CouponType;
  status: CouponStatus;
  createdAt: number;
  usedAt?: number;
  expiresAt?: number;
  customerName?: string;
  usageLimit?: number | null;
  usageCount?: number;
  _rev?: number;
  _lastOpId?: string;
  _lastModifiedBy?: string;
  _serverUpdatedAt?: any;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  saleId?: string;
  saleInvoice: string;
  status: 'ACTIVE' | 'CANCELLED';
  redeemedAt: number;
}

export interface SavedOrder {
  id: string;
  orderNumber: string;
  createdAt: number;
  updatedAt: number;
  customer?: Customer;
  items: CartItem[];
  subtotalPaise: number;
  taxPaise: number;
  discountPaise: number;
  grandTotalPaise: number;
  status: 'draft' | 'completed' | 'cancelled';
  _rev?: number;
  _lastOpId?: string;
  _lastModifiedBy?: string;
  _serverUpdatedAt?: any;
}

export interface RegisterLease {
  id: string;
  registerCode: string;
  ownerDeviceId: string;
  deviceName: string;
  leaseStatus: RegisterLeaseStatus;
  registrationEpoch: number;
  leaseExpiresAt: number;
  lastSyncAt?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface StoreSettings {
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  gstin?: string;
  taxRatePercent: number;
  taxEnabled: boolean;
  receiptHeader?: string;
  receiptFooter?: string;
  showShopName?: boolean;
  showShopAddress?: boolean;
  showShopPhone?: boolean;
  showShopGstin?: boolean;
  showThankYouMessage?: boolean;
  _rev?: number;
  _lastOpId?: string;
  _lastModifiedBy?: string;
  _serverUpdatedAt?: any;
}

export interface DashboardKPIs {
  todayRevenuePaise: number;
  todaySalesCount: number;
  todayAverageOrderPaise: number;
  activeProductsCount: number;
  pendingOrdersCount: number;
  activeCouponsCount: number;
  cancellationRatePercent: number;
}

export type TimeRange = 'today' | 'yesterday' | '7d' | '30d' | 'custom';
