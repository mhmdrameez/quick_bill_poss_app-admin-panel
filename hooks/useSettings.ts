// hooks/useSettings.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { StoreSettings } from '@/lib/types';
import { sampleSettings } from '@/lib/sample-data';
import { buildSyncMetadata } from '@/lib/sync-metadata';

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>(sampleSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setSettings(sampleSettings);
      setLoading(false);
      return;
    }

    if (user.isDemo || !db) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`quickbill_settings_${user.uid}`) : null;
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch {
          setSettings(sampleSettings);
        }
      } else {
        setSettings(sampleSettings);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    const settingsDocRef = doc(db, `users/${user.uid}/settings/store_settings`);

    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as StoreSettings);
        } else {
          setSettings(sampleSettings);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Settings snapshot notice:', err);
        setSettings(sampleSettings);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateSettings = useCallback(
    async (newSettings: Partial<StoreSettings>): Promise<StoreSettings> => {
      if (!user) throw new Error('Not authenticated');

      setSaving(true);
      const currentRev = settings._rev ?? 1;
      const syncMeta = buildSyncMetadata(currentRev);

      const mergedSettings: StoreSettings = {
        ...settings,
        ...newSettings,
        ...syncMeta,
      };

      try {
        if (user.isDemo || !db) {
          setSettings(mergedSettings);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`quickbill_settings_${user.uid}`, JSON.stringify(mergedSettings));
          }
          return mergedSettings;
        }

        const settingsDocRef = doc(db, `users/${user.uid}/settings/store_settings`);
        await setDoc(settingsDocRef, mergedSettings, { merge: true });
        return mergedSettings;
      } finally {
        setSaving(false);
      }
    },
    [user, settings]
  );

  return {
    settings,
    loading,
    saving,
    updateSettings,
  };
}
