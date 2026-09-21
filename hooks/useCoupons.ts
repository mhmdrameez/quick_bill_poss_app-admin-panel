// hooks/useCoupons.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Coupon, CouponRedemption } from '@/lib/types';
import { sampleCoupons } from '@/lib/sample-data';
import { buildSyncMetadata } from '@/lib/sync-metadata';

export function useCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCoupons([]);
      setLoading(false);
      return;
    }

    if (user.isDemo || !db) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`quickbill_coupons_${user.uid}`) : null;
      if (saved) {
        try {
          setCoupons(JSON.parse(saved));
        } catch {
          setCoupons(sampleCoupons);
        }
      } else {
        setCoupons(sampleCoupons);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    const couponsColRef = collection(db, `users/${user.uid}/coupons`);

    const unsubscribe = onSnapshot(
      couponsColRef,
      (snapshot) => {
        const list: Coupon[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Coupon);
        });

        if (list.length === 0) {
          setCoupons(sampleCoupons);
        } else {
          setCoupons(list);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Coupons onSnapshot notice:', err);
        setCoupons(sampleCoupons);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Create Coupon
  const addCoupon = useCallback(
    async (data: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>): Promise<Coupon> => {
      if (!user) throw new Error('Not authenticated');

      const id = `coup_${uuidv4()}`;
      const now = Date.now();
      const syncMeta = buildSyncMetadata(0);

      const newCoupon: Coupon = {
        id,
        code: data.code.trim().toUpperCase(),
        amountPaise: data.amountPaise || 0,
        discountPercent: data.discountPercent,
        type: data.type,
        status: 'active',
        createdAt: now,
        expiresAt: data.expiresAt,
        customerName: data.customerName,
        usageLimit: data.usageLimit,
        usageCount: 0,
        ...syncMeta,
      };

      if (user.isDemo || !db) {
        const updated = [newCoupon, ...coupons];
        setCoupons(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_coupons_${user.uid}`, JSON.stringify(updated));
        }
        return newCoupon;
      }

      const couponRef = doc(db, `users/${user.uid}/coupons/${id}`);
      await setDoc(couponRef, newCoupon);
      return newCoupon;
    },
    [user, coupons]
  );

  // Edit Coupon
  const editCoupon = useCallback(
    async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
      if (!user) throw new Error('Not authenticated');

      const existing = coupons.find((c) => c.id === id);
      const currentRev = existing?._rev ?? 1;
      const syncMeta = buildSyncMetadata(currentRev);

      const updatedCoupon: Coupon = {
        ...(existing || ({} as Coupon)),
        ...data,
        ...syncMeta,
      };

      if (user.isDemo || !db) {
        const updated = coupons.map((c) => (c.id === id ? updatedCoupon : c));
        setCoupons(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_coupons_${user.uid}`, JSON.stringify(updated));
        }
        return updatedCoupon;
      }

      const couponRef = doc(db, `users/${user.uid}/coupons/${id}`);
      await updateDoc(couponRef, {
        ...data,
        ...syncMeta,
      });

      return updatedCoupon;
    },
    [user, coupons]
  );

  // Deactivate Coupon
  const deactivateCoupon = useCallback(
    async (id: string): Promise<void> => {
      await editCoupon(id, { status: 'cancelled' });
    },
    [editCoupon]
  );

  // Load redemptions
  const getCouponRedemptions = useCallback(
    async (couponId: string, couponCode: string): Promise<CouponRedemption[]> => {
      if (!user) return [];

      if (user.isDemo || !db) {
        return [
          {
            id: 'red_001',
            couponId,
            saleInvoice: 'INV-2026-0042',
            status: 'ACTIVE',
            redeemedAt: Date.now() - 35 * 60 * 1000,
          },
        ];
      }

      try {
        const redemptionsCol = collection(db, `users/${user.uid}/couponRedemptions`);
        const q = query(redemptionsCol, where('couponId', '==', couponId));
        const snap = await getDocs(q);
        const list: CouponRedemption[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as CouponRedemption);
        });
        return list;
      } catch (err) {
        console.warn('Could not fetch coupon redemptions:', err);
        return [];
      }
    },
    [user]
  );

  return {
    coupons,
    loading,
    error,
    addCoupon,
    editCoupon,
    deactivateCoupon,
    getCouponRedemptions,
  };
}
