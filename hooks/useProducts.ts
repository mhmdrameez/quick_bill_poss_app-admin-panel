// hooks/useProducts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/lib/types';
import { sampleProducts } from '@/lib/sample-data';
import { buildSyncMetadata } from '@/lib/sync-metadata';

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    if (user.isDemo || !db) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`quickbill_products_${user.uid}`) : null;
      if (saved) {
        try {
          setProducts(JSON.parse(saved));
        } catch {
          setProducts(sampleProducts);
        }
      } else {
        setProducts(sampleProducts);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    const productsColRef = collection(db, `users/${user.uid}/products`);

    const unsubscribe = onSnapshot(
      productsColRef,
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (!data.isDeleted) {
            list.push({ id: d.id, ...data } as Product);
          }
        });

        if (list.length === 0) {
          setProducts(sampleProducts);
        } else {
          setProducts(list);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Products onSnapshot notice:', err);
        setProducts(sampleProducts);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Add Product
  const addProduct = useCallback(
    async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
      if (!user) throw new Error('Not authenticated');

      const id = `prod_${uuidv4()}`;
      const now = Date.now();
      const syncMeta = buildSyncMetadata(0);

      const newProduct: Product = {
        id,
        name: data.name,
        pricePaise: data.pricePaise,
        barcode: data.barcode || '',
        category: data.category || 'General',
        stock: typeof data.stock === 'number' ? data.stock : 0,
        createdAt: now,
        updatedAt: now,
        ...syncMeta,
      };

      if (user.isDemo || !db) {
        const updated = [newProduct, ...products];
        setProducts(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_products_${user.uid}`, JSON.stringify(updated));
        }
        return newProduct;
      }

      const productRef = doc(db, `users/${user.uid}/products/${id}`);
      await setDoc(productRef, newProduct);
      return newProduct;
    },
    [user, products]
  );

  // Edit Product
  const editProduct = useCallback(
    async (id: string, data: Partial<Product>): Promise<Product> => {
      if (!user) throw new Error('Not authenticated');

      const existing = products.find((p) => p.id === id);
      const currentRev = existing?._rev ?? 1;
      const syncMeta = buildSyncMetadata(currentRev);
      const now = Date.now();

      const updatedProduct: Product = {
        ...(existing || ({} as Product)),
        ...data,
        updatedAt: now,
        ...syncMeta,
      };

      if (user.isDemo || !db) {
        const updated = products.map((p) => (p.id === id ? updatedProduct : p));
        setProducts(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_products_${user.uid}`, JSON.stringify(updated));
        }
        return updatedProduct;
      }

      const productRef = doc(db, `users/${user.uid}/products/${id}`);
      await updateDoc(productRef, {
        ...data,
        updatedAt: now,
        ...syncMeta,
      });

      return updatedProduct;
    },
    [user, products]
  );

  // Soft Delete Product
  const deleteProduct = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      const existing = products.find((p) => p.id === id);
      const currentRev = existing?._rev ?? 1;
      const syncMeta = buildSyncMetadata(currentRev);

      if (user.isDemo || !db) {
        const updated = products.filter((p) => p.id !== id);
        setProducts(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_products_${user.uid}`, JSON.stringify(updated));
        }
        return;
      }

      const productRef = doc(db, `users/${user.uid}/products/${id}`);
      await updateDoc(productRef, {
        isDeleted: true,
        updatedAt: Date.now(),
        ...syncMeta,
      });
    },
    [user, products]
  );

  // Bulk Import
  const bulkImportProducts = useCallback(
    async (importedList: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<number> => {
      if (!user) throw new Error('Not authenticated');

      const now = Date.now();
      const newItems: Product[] = importedList.map((item) => ({
        id: `prod_${uuidv4()}`,
        name: item.name,
        pricePaise: item.pricePaise,
        barcode: item.barcode || '',
        category: item.category || 'General',
        stock: typeof item.stock === 'number' ? item.stock : 0,
        createdAt: now,
        updatedAt: now,
        ...buildSyncMetadata(0),
      }));

      if (user.isDemo || !db) {
        const updated = [...newItems, ...products];
        setProducts(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`quickbill_products_${user.uid}`, JSON.stringify(updated));
        }
        return newItems.length;
      }

      const batch = writeBatch(db);
      newItems.forEach((p) => {
        const ref = doc(db, `users/${user.uid}/products/${p.id}`);
        batch.set(ref, p);
      });

      await batch.commit();
      return newItems.length;
    },
    [user, products]
  );

  return {
    products,
    loading,
    error,
    addProduct,
    editProduct,
    deleteProduct,
    bulkImportProducts,
  };
}
