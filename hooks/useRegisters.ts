// hooks/useRegisters.ts
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { RegisterLease } from '@/lib/types';
import { sampleRegisters } from '@/lib/sample-data';

export function useRegisters() {
  const { user } = useAuth();
  const [registers, setRegisters] = useState<RegisterLease[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setRegisters([]);
      setLoading(false);
      return;
    }

    if (user.isDemo || !db) {
      setRegisters(sampleRegisters);
      setLoading(false);
      return;
    }

    setLoading(true);
    const regColRef = collection(db, `users/${user.uid}/registers`);

    const unsubscribe = onSnapshot(
      regColRef,
      (snapshot) => {
        const list: RegisterLease[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as RegisterLease);
        });

        if (list.length === 0) {
          setRegisters(sampleRegisters);
        } else {
          setRegisters(list);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Registers snapshot notice:', err);
        setRegisters(sampleRegisters);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    registers,
    loading,
  };
}
