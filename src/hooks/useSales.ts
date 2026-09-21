// hooks/useSales.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { CompletedSale, AuditEvent } from '@/lib/types';
import { sampleSales, sampleAuditEvents } from '@/lib/sample-data';
import { buildSyncMetadata, createAuditEvent } from '@/lib/sync-metadata';

export function useSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<CompletedSale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setSales([]);
      setLoading(false);
      setIsLive(false);
      return;
    }

    if (user.isDemo || !db) {
      // Load sample or local storage sales for demo mode
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`quickbill_sales_${user.uid}`) : null;
      if (saved) {
        try {
          setSales(JSON.parse(saved));
        } catch {
          setSales(sampleSales);
        }
      } else {
        setSales(sampleSales);
      }
      setLoading(false);
      setIsLive(true);
      return;
    }

    setLoading(true);
    const salesCollectionRef = collection(db, `users/${user.uid}/sales`);
    const q = query(salesCollectionRef, orderBy('completedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedSales: CompletedSale[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedSales.push({
            id: docSnap.id,
            ...data,
          } as CompletedSale);
        });

        // Fallback to sample sales if Firestore collection is brand new and empty
        if (loadedSales.length === 0) {
          setSales(sampleSales);
        } else {
          setSales(loadedSales);
        }
        setLoading(false);
        setIsLive(true);
        setError(null);
      },
      (err) => {
        console.warn('Sales onSnapshot listener notice:', err);
        // If permission error or unconfigured, fallback gracefully to sample sales
        setSales(sampleSales);
        setLoading(false);
        setIsLive(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load audit trail for a specific sale
  const getSaleAuditEvents = useCallback(
    async (saleId: string): Promise<AuditEvent[]> => {
      if (!user) return [];

      if (user.isDemo || !db) {
        return sampleAuditEvents[saleId] || [
          {
            id: `aud_demo_${saleId}`,
            saleId,
            actorUid: user.uid,
            operationId: 'op_init',
            rev: 1,
            operationType: 'CREATE',
            source: 'POS_DEVICE',
            timestamp: Date.now() - 3600000,
          },
        ];
      }

      try {
        const auditColRef = collection(db, `users/${user.uid}/sales/${saleId}/audit_events`);
        const q = query(auditColRef, orderBy('timestamp', 'asc'));
        const snap = await getDocs(q);
        const events: AuditEvent[] = [];
        snap.forEach((d) => {
          events.push({ id: d.id, ...d.data() } as AuditEvent);
        });
        return events.length > 0 ? events : (sampleAuditEvents[saleId] || []);
      } catch (err) {
        console.error('Failed to get audit events:', err);
        return sampleAuditEvents[saleId] || [];
      }
    },
    [user]
  );

  // Edit sale with sync metadata and audit trail
  const editSale = useCallback(
    async (saleId: string, updatedFields: Partial<CompletedSale>, note: string = 'Edited from Admin Web') => {
      if (!user) throw new Error('Not authenticated');

      const existingSale = sales.find((s) => s.id === saleId);
      const currentRev = existingSale?._rev ?? 1;
      const syncMeta = buildSyncMetadata(currentRev);

      if (user.isDemo || !db) {
        const updatedSale: CompletedSale = {
          ...existingSale!,
          ...updatedFields,
          ...syncMeta,
          editedAt: Date.now(),
          updatedAt: Date.now(),
        };

        const newSales = sales.map((s) => (s.id === saleId ? updatedSale : s));
        setSales(newSales);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_sales_${user.uid}`, JSON.stringify(newSales));
        }

        // Add demo audit event
        const newAuditEvent: AuditEvent = {
          id: `aud_${Date.now()}`,
          saleId,
          actorUid: user.uid,
          operationId: syncMeta._lastOpId,
          rev: syncMeta._rev,
          operationType: 'EDIT',
          source: 'ADMIN_WEB',
          timestamp: Date.now(),
          details: { note, changes: updatedFields },
        };
        sampleAuditEvents[saleId] = [...(sampleAuditEvents[saleId] || []), newAuditEvent];

        return updatedSale;
      }

      // Firestore live write
      const saleDocRef = doc(db, `users/${user.uid}/sales/${saleId}`);
      const saleSnap = await getDoc(saleDocRef);
      const liveRev = saleSnap.exists() ? (saleSnap.data()?._rev ?? 1) : currentRev;
      const meta = buildSyncMetadata(liveRev);

      const payload = {
        ...updatedFields,
        ...meta,
        editedAt: Date.now(),
        updatedAt: Date.now(),
      };

      await updateDoc(saleDocRef, payload);

      // Create immutable audit event
      await createAuditEvent(user.uid, saleId, 'EDIT', meta._lastOpId, meta._rev, {
        note,
        changes: updatedFields,
      });

      return { id: saleId, ...payload } as CompletedSale;
    },
    [user, sales]
  );

  // Cancel sale with coupon reversal and audit trail
  const cancelSale = useCallback(
    async (saleId: string, reason: string = 'Cancelled from Admin Web') => {
      if (!user) throw new Error('Not authenticated');

      const existingSale = sales.find((s) => s.id === saleId);
      if (!existingSale) throw new Error('Sale not found');

      const currentRev = existingSale._rev ?? 1;
      const syncMeta = buildSyncMetadata(currentRev);

      if (user.isDemo || !db) {
        const updatedSale: CompletedSale = {
          ...existingSale,
          status: 'cancelled',
          cancelledAt: Date.now(),
          updatedAt: Date.now(),
          ...syncMeta,
        };

        const newSales = sales.map((s) => (s.id === saleId ? updatedSale : s));
        setSales(newSales);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_sales_${user.uid}`, JSON.stringify(newSales));
        }

        const cancelEvent: AuditEvent = {
          id: `aud_${Date.now()}`,
          saleId,
          actorUid: user.uid,
          operationId: syncMeta._lastOpId,
          rev: syncMeta._rev,
          operationType: 'CANCEL',
          source: 'ADMIN_WEB',
          timestamp: Date.now(),
          details: { reason, reversedCoupon: Boolean(existingSale.appliedCouponId) },
        };
        sampleAuditEvents[saleId] = [...(sampleAuditEvents[saleId] || []), cancelEvent];

        return updatedSale;
      }

      // Live Firestore cancellation
      const saleDocRef = doc(db, `users/${user.uid}/sales/${saleId}`);
      const saleSnap = await getDoc(saleDocRef);
      const liveRev = saleSnap.exists() ? (saleSnap.data()?._rev ?? 1) : currentRev;
      const meta = buildSyncMetadata(liveRev);

      await updateDoc(saleDocRef, {
        status: 'cancelled',
        cancelledAt: Date.now(),
        updatedAt: Date.now(),
        ...meta,
      });

      // If coupon was applied, record couponRedemption cancellation
      if (existingSale.appliedCouponId) {
        try {
          const redemptionRef = doc(db, `users/${user.uid}/couponRedemptions/red_${saleId}`);
          await setDoc(
            redemptionRef,
            {
              status: 'CANCELLED',
              cancelledAt: Date.now(),
              _serverUpdatedAt: meta._serverUpdatedAt,
            },
            { merge: true }
          );
        } catch (e) {
          console.warn('Coupon redemption cancellation notice:', e);
        }
      }

      // Create immutable audit event
      await createAuditEvent(user.uid, saleId, 'CANCEL', meta._lastOpId, meta._rev, {
        reason,
        invoiceNumber: existingSale.invoiceNumber,
        reversedCoupon: Boolean(existingSale.appliedCouponId),
      });

      return {
        ...existingSale,
        status: 'cancelled',
        cancelledAt: Date.now(),
        ...meta,
      };
    },
    [user, sales]
  );

  return {
    sales,
    loading,
    error,
    isLive,
    getSaleAuditEvents,
    editSale,
    cancelSale,
  };
}
