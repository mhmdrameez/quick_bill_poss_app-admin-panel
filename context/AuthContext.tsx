// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';

interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInDemoMode: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => {},
  signInDemoMode: () => {},
  signOut: async () => {},
});

const DEMO_USER: AdminUser = {
  uid: 'usr_owner_demo_admin',
  email: 'admin@quickbillpos.com',
  displayName: 'Quick Bill Admin (Demo)',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isDemo: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for demo user
    const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('quickbill_demo_user') : null;
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('quickbill_demo_user');
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    // Set browser persistence
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // Check for redirect result (crucial for mobile browser sign-ins)
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const fbUser = result.user;
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Merchant Admin',
            photoURL: fbUser.photoURL,
            isDemo: false,
          });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Redirect auth result check:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Merchant Admin',
          photoURL: fbUser.photoURL,
          isDemo: false,
        });
      } else {
        if (!localStorage.getItem('quickbill_demo_user')) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Auth is not properly initialized. Check your environment configuration.');
    }
    setLoading(true);
    try {
      localStorage.removeItem('quickbill_demo_user');
      
      // Attempt popup sign-in first
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Merchant Admin',
        photoURL: fbUser.photoURL,
        isDemo: false,
      });
    } catch (error: any) {
      console.warn('Popup sign in failed, checking redirect fallback:', error);
      
      // If mobile browser blocks popup or storage is partitioned (missing initial state)
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/missing-initial-state' ||
        error.message?.includes('missing initial state') ||
        error.message?.includes('storage-partitioned')
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          console.error('Redirect sign-in also failed:', redirectError);
          throw redirectError;
        }
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInDemoMode = () => {
    setUser(DEMO_USER);
    if (typeof window !== 'undefined') {
      localStorage.setItem('quickbill_demo_user', JSON.stringify(DEMO_USER));
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('quickbill_demo_user');
      }
      if (auth && auth.currentUser) {
        await firebaseSignOut(auth);
      }
      setUser(null);
    } catch (error) {
      console.error('Sign-out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        signInDemoMode,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
