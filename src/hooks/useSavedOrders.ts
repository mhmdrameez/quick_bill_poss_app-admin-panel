// hooks/useSavedOrders.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { SavedOrder } from '@/lib/types';
import { sampleSavedOrders } from '@/lib/sample-data';

export function useSavedOrders() {
  const { user } = useAuth();
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSavedOrders([]);
      setLoading(false);
      return;
    }

    if (user.isDemo || !db) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`quickbill_saved_orders_${user.uid}`) : null;
      if (saved) {
        try {
          setSavedOrders(JSON.parse(saved));
        } catch {
          setSavedOrders(sampleSavedOrders);
        }
      } else {
        setSavedOrders(sampleSavedOrders);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    const ordersColRef = collection(db, `users/${user.uid}/savedOrders`);

    const unsubscribe = onSnapshot(
      ordersColRef,
      (snapshot) => {
        const list: SavedOrder[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as SavedOrder);
        });

        if (list.length === 0) {
          setSavedOrders(sampleSavedOrders);
        } else {
          setSavedOrders(list);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Saved orders snapshot notice:', err);
        setSavedOrders(sampleSavedOrders);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const deleteSavedOrder = useCallback(
    async (orderId: string): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      if (user.isDemo || !db) {
        const updated = savedOrders.filter((o) => o.id !== orderId);
        setSavedOrders(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_saved_orders_${user.uid}`, JSON.stringify(updated));
        }
        return;
      }

      const docRef = doc(db, `users/${user.uid}/savedOrders/${orderId}`);
      await deleteDoc(docRef);
    },
    [user, savedOrders]
  );

  return {
    savedOrders,
    loading,
    error,
    deleteSavedOrder,
  };
}
