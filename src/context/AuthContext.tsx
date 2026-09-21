// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  type User as FirebaseUser,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';

export interface AdminUser {
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
  // Synchronous cache read for instantaneous 0ms perceived loading if user was already cached
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const demo = localStorage.getItem('quickbill_demo_user');
      if (demo) {
        try {
          return JSON.parse(demo);
        } catch {
          localStorage.removeItem('quickbill_demo_user');
        }
      }
      const cached = localStorage.getItem('quickbill_cached_auth_user');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          localStorage.removeItem('quickbill_cached_auth_user');
        }
      }
    }
    return null;
  });

  // Start loading = true unless user is already cached in localStorage
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('quickbill_demo_user') || localStorage.getItem('quickbill_cached_auth_user')) {
        return false;
      }
    }
    return true; // Must wait for Firebase auth to initialize on cold mobile/app load
  });

  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      setPersistence(auth, browserLocalPersistence).catch(() => {});

      // 1. Process Google OAuth redirect results (Essential for Mobile App & WebViews)
      getRedirectResult(auth)
        .then((result) => {
          if (result && result.user) {
            const fbUser = result.user;
            const userData: AdminUser = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Merchant Admin',
              photoURL: fbUser.photoURL,
              isDemo: false,
            };
            setUser(userData);
            localStorage.setItem('quickbill_cached_auth_user', JSON.stringify(userData));
            setLoading(false);

            if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/')) {
              window.location.replace('/dashboard');
            }
          }
        })
        .catch((err) => {
          console.warn('Redirect auth result notice:', err);
        });

      // 2. Real-time auth state listener (Restores session from IndexedDB)
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const userData: AdminUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Merchant Admin',
            photoURL: fbUser.photoURL,
            isDemo: false,
          };
          setUser(userData);
          localStorage.setItem('quickbill_cached_auth_user', JSON.stringify(userData));
        } else {
          if (!localStorage.getItem('quickbill_demo_user')) {
            setUser(null);
            localStorage.removeItem('quickbill_cached_auth_user');
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Auth initialization notice:', err);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Auth is not properly initialized. Check your environment configuration.');
    }
    setLoading(true);
    try {
      localStorage.removeItem('quickbill_demo_user');

      // Detect mobile / webview environment
      const isMobileOrApp =
        typeof navigator !== 'undefined' &&
        (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
          (window as any).navigator?.standalone ||
          window.matchMedia('(display-mode: standalone)').matches);

      if (isMobileOrApp) {
        // Mobile / App WebView: use redirect to avoid popup blockers and storage partitioning issues
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      // Desktop PC: use popup for fast, instant, zero-reload experience
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userData: AdminUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Merchant Admin',
        photoURL: fbUser.photoURL,
        isDemo: false,
      };
      setUser(userData);
      localStorage.setItem('quickbill_cached_auth_user', JSON.stringify(userData));
      if (typeof window !== 'undefined') {
        window.location.replace('/dashboard');
      }
    } catch (error: any) {
      console.warn('Popup sign in failed, falling back to redirect:', error);

      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/missing-initial-state' ||
        error.message?.includes('missing initial state') ||
        error.message?.includes('storage-partitioned') ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
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
      window.location.replace('/dashboard');
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('quickbill_demo_user');
        localStorage.removeItem('quickbill_cached_auth_user');
      }
      if (auth && auth.currentUser) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
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
